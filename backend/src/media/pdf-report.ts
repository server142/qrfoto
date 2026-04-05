import PDFDocument from 'pdfkit';
import { Stream } from 'stream';

export async function generateEventPdf(eventName: string, eventDate: string, mediaItems: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });

        // --- HEADER ---
        doc.fillColor("#000000").fontSize(32).font('Helvetica-Bold').text('QRFoto', { align: 'left' });
        doc.fontSize(10).font('Helvetica').text('MEMORIAS DIGITALES EN TIEMPO REAL', { characterSpacing: 1, align: 'left' }).moveDown(2);

        doc.rect(50, 110, 512, 2).fill('#A855F7'); // Purple line

        doc.moveDown(4);
        doc.fillColor("#000000").fontSize(26).font('Helvetica-Bold').text(eventName.toUpperCase(), { align: 'center' });
        doc.fontSize(12).font('Helvetica').fillColor("#666666").text(`Fecha del Evento: ${new Date(eventDate).toLocaleDateString()}`, { align: 'center' }).moveDown(3);

        // --- CONTENT ---
        doc.fillColor("#000000").fontSize(14).font('Helvetica-Bold').text('Mensajes y Dedicatorias', { underline: true }).moveDown(1.5);

        const itemsWithMessages = mediaItems.filter(item => item.message && item.message.trim() !== '');

        if (itemsWithMessages.length === 0) {
            doc.fontSize(11).font('Helvetica-Oblique').fillColor("#999999").text('No se registraron mensajes de texto en este evento.');
        } else {
            itemsWithMessages.forEach((item, index) => {
                // Check for page overflow
                if (doc.y > 650) doc.addPage();

                doc.fontSize(10).font('Helvetica-Bold').fillColor("#A855F7").text(`${item.guest_name || 'Invitado'}:`);
                doc.fontSize(12).font('Helvetica-Oblique').fillColor("#333333").text(`"${item.message}"`, { indent: 10 }).moveDown(0.5);
                doc.fontSize(8).font('Helvetica').fillColor("#999999").text(`${new Date(item.created_at).toLocaleString()}`, { align: 'right' }).moveDown(1.5);

                doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#EEEEEE").stroke();
                doc.moveDown(1);
            });
        }

        // --- FOOTER ---
        const pageCount = (doc as any)._pageBuffer.length;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor("#CCCCCC").text(`Generado automáticamente por QRFoto Events - Página ${i + 1} de ${pageCount}`, 50, 750, { align: 'center' });
        }

        doc.end();
    });
}
