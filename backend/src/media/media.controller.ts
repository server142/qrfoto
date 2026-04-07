import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Query,
  Req,
  Res,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Media, MediaType } from './entities/media.entity';
import { EventsService } from '../events/events.service';
import { EventsGateway } from '../events/events.gateway';
import { UsersService } from '../users/users.service';

@Controller('api/media')
export class MediaController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly eventsService: EventsService,
    private readonly eventsGateway: EventsGateway,
    private readonly usersService: UsersService,
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>
  ) { }

  private censorMessage(text: string): string {
    if (!text) return text;
    // Diccionario de FASE 1 - Opción A Silenciosa
    const badWords = [
      'puto', 'puta', 'putos', 'putas', 'pendejo', 'pendeja', 'pendejos', 'pendejas', 
      'cabron', 'cabrón', 'cabrones', 'chinga', 'chingar', 'verga', 'vergazo', 
      'culo', 'culero', 'culera', 'mierda', 'pinche', 'joto', 'maricon', 'maricón', 
      'zorra', 'perra'
    ];
    // Replace whole words, case-insensitive
    const regex = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi');
    return text.replace(regex, '***');
  }

  @Post(':slug/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('guest_name') guestName?: string,
    @Query('guest_email') guestEmail?: string,
    @Query('message') rawMessage?: string,
  ) {
    if (!file && !rawMessage) throw new BadRequestException('No file or message uploaded');

    const event = await this.eventsService.findOneBySlug(slug);
    if (!event) throw new BadRequestException('Event invalid');
    if (event.status === 'Finished') throw new BadRequestException('This event has already ended.');

    // Aplicar Filtro Sanitario silcencioso al mensaje (Fase 1)
    const message = this.censorMessage(rawMessage || "");

    // Validación de ALMACENAMIENTO (Guardia de Almacenamiento Inteligente)
    if (event.userId && file) {
      const userData = await this.usersService.getMe(event.userId);
      if (userData) {
        const planLimit = userData.activePlan?.storage_limit_mb || 0;
        const extraLimit = userData.extra_storage_mb || 0;
        const totalLimitMb = planLimit + extraLimit;

        // Calcular uso actual del usuario (todos sus eventos)
        const userEvents = await this.eventsService.findAll(event.userId);
        const eventIds = userEvents.map(e => e.id);

        const storageUsage = await this.mediaRepo.sum('size_bytes', {
          event_id: In(eventIds)
        }) || 0;

        const usageMb = storageUsage / (1024 * 1024);

        if (usageMb >= totalLimitMb) {
          throw new BadRequestException(`Límite de almacenamiento alcanzado (${totalLimitMb}MB). Libera espacio o amplía tu capacidad para continuar.`);
        }
      }
    }

    let fileKey: string | null = null;
    if (file) {
      fileKey = await this.uploadsService.uploadFile(file, `events/${event.id}`);
    }

    const mediaObj: any = {
      event_id: event.id,
      guest_name: guestName || 'Invitado',
      guest_email: guestEmail || null,
      message: message || undefined,
      file_url: fileKey,
      file_type: file
        ? file.mimetype.includes('video')
          ? MediaType.VIDEO
          : MediaType.IMAGE
        : MediaType.IMAGE,
      size_bytes: file ? file.size : 0,
    };

    const media = this.mediaRepo.create(mediaObj);
    const savedMedia = await this.mediaRepo.save(media);

    const publicUrl = fileKey ? this.uploadsService.getPublicUrl(fileKey) : null;

    console.log(`[Media] Upload from "${guestName}" <${guestEmail || 'no-email'}> for event ${event.id}`);

    this.eventsGateway.server.to(event.id).emit('mediaAdded', {
      ...savedMedia,
      file_url: publicUrl,
    });

    return { message: 'Upload successful', media: { ...savedMedia, file_url: publicUrl } };
  }

  @Get(':slug')
  async getEventMedia(@Param('slug') slug: string) {
    const event = await this.eventsService.findOneBySlug(slug);
    const mediaItems = await this.mediaRepo.find({
      where: { event_id: event.id, status: 'Active' },
      order: { created_at: 'DESC' },
    });

    const itemsWithUrls = mediaItems.map((item) => ({
      ...item,
      file_url: item.file_url ? this.uploadsService.getPublicUrl(item.file_url) : null,
    }));

    return itemsWithUrls;
  }

  @Get(':slug/download')
  async downloadEventMedia(@Param('slug') slug: string, @Res() res: any) {
    const event = await this.eventsService.findOneBySlug(slug);

    // Validación de Característica Premium (Bulk Download)
    if (event.userId) {
      const userData = await this.usersService.getMe(event.userId);
      if (userData && userData.activePlan) {
        const plan = userData.activePlan;
        if (plan.has_bulk_download === false) {
          throw new BadRequestException('Bulk download is not available on your current plan. Please upgrade to Oro/Plata.');
        }
      }
    }

    const mediaItems = await this.mediaRepo.find({
      where: { event_id: event.id, status: 'Active' },
      order: { created_at: 'ASC' },
    });

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Header management for mobile compatibility
    const safeFilename = encodeURIComponent(event.name.replace(/[^a-zA-Z0-9]/g, '_')) + '_Memories.zip';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`);

    // Error handling for the archiver
    archive.on('error', (err: any) => {
      console.error('[Archiver Error]', err);
      if (!res.headersSent) {
        res.status(500).send({ message: 'Error generating archive' });
      }
    });

    archive.pipe(res);

    const mediaListData: any[] = [];

    for (const item of mediaItems) {
      if (!item.file_url) continue;

      const extension = item.file_url.split('.').pop() || 'jpg';
      const filename = `media_${item.id.substring(0, 8)}.${extension}`;

      try {
        const stream = await this.uploadsService.getFileStream(item.file_url);
        archive.append(stream, { name: filename });

        mediaListData.push({
          filename,
          guest_name: item.guest_name,
          message: item.message,
          file_type: item.file_type,
          created_at: item.created_at
        });
      } catch (err) {
        console.error(`Error archiving file ${item.file_url}:`, err.message);
      }
    }

    // --- ADD PDF REPORT (Messages) ---
    const { generateEventPdf } = require('./pdf-report');
    try {
      const pdfBuffer = await generateEventPdf(event.name, event.event_date.toString(), mediaItems);
      archive.append(pdfBuffer, { name: 'REPORTE_DEDICATORIAS.pdf' });
    } catch (err) {
      console.error("Error generating PDF in zip:", err.message);
    }

    // Add Player Data
    const { getPlayerHtml } = require('./player.template');
    const playerHtml = getPlayerHtml(event.name, mediaListData);
    archive.append(playerHtml, { name: 'REPRODUCTOR_QRFOTO.html' });

    // Add JSON Data
    archive.append(JSON.stringify(mediaListData, null, 2), { name: 'DATOS_EVENTO.json' });

    // Add Instructions
    const instructions = `
===========================================================
QRFOTO EVENTS - EXPORT BUNDLE
===========================================================

Gracias por usar QRFoto para capturar tus momentos.

INSTRUCCIONES:
1. Descomprime (Extrae) todos los archivos de este ZIP en una carpeta.
2. Abre el archivo "REPRODUCTOR_QRFOTO.html" con cualquier navegador (Chrome, Edge, Safari).
3. Podrás ver todas las fotos y videos en una galería interactiva.

CONSEJO:
- Si abres el reproductor sin descomprimir el ZIP, las imágenes podrían no verse. 
- ¡Asegúrate siempre de EXTRAER TODO antes!

-----------------------------------------------------------
QRFoto Events • Memorias en Tiempo Real
===========================================================
    `;
    archive.append(instructions, { name: 'LEEME_INSTRUCCIONES.txt' });

    await archive.finalize();
  }

  @Get('s3/*')
  async proxyMediaStream(@Req() req: any, @Res() res: any) {
    // Fail-safe way to get the file key from the URL itself in case routing params fail
    const urlParts = req.url.split('/s3/');
    const fileKey = urlParts[urlParts.length - 1]?.split('?')[0];

    if (!fileKey) throw new BadRequestException('No file key provided');

    try {
      const stream = await this.uploadsService.getFileStream(fileKey);

      // Attempt to guess mime type from extension
      const ext = fileKey.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'gif') contentType = 'image/gif';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'mp4') contentType = 'video/mp4';
      else if (ext === 'webm') contentType = 'video/webm';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      if (typeof stream.transformToByteArray === 'function') {
        const byteArray = await stream.transformToByteArray();
        res.send(Buffer.from(byteArray));
      } else {
        stream.pipe(res);
      }
    } catch (err) {
      console.error(`[MediaProxy] Error streaming file ${fileKey}:`, err.message);
      res.status(404).send('File not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMedia(@Param('id') id: string, @Req() req: any) {
    const mediaItem = await this.mediaRepo.findOne({ where: { id } });
    if (!mediaItem) {
      throw new BadRequestException('Media no encontrada');
    }

    const event = await this.eventsService.findOne(mediaItem.event_id);
    if (!event) {
      throw new BadRequestException('Evento no encontrado');
    }

    // Role check logic based on req.user
    if (req.user.role !== 'super_admin' && event.userId !== req.user.userId) {
      throw new UnauthorizedException('No tienes permisos para eliminar esta imagen');
    }

    // 1. Remove from S3/MinIO
    if (mediaItem.file_url) {
      await this.uploadsService.deleteFile(mediaItem.file_url);
    }

    // 2. Remove from DB
    await this.mediaRepo.remove(mediaItem);

    // 3. Notify frontend
    this.eventsGateway.server.to(event.id).emit('mediaDeleted', { id: mediaItem.id });

    return { success: true, message: 'Media removed successfully' };
  }
}
