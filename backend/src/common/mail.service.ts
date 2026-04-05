import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    console.log('---------------------------------------------------------');
    console.log(`[EMAIL SIMULATOR] To: ${email}`);
    console.log(`[EMAIL SIMULATOR] Subject: Recuperación de Contraseña - QRFoto`);
    console.log(`[EMAIL SIMULATOR] Link: ${resetUrl}`);
    console.log('---------------------------------------------------------');
    // En producción aquí se usaría nodemailer / SendGrid / Amazon SES
    return true;
  }
}
