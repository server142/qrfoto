import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
    @PrimaryColumn({ default: 'main' })
    id: string;

    @Column({ default: true })
    isSlideshowEnabled: boolean;

    @Column({ nullable: true })
    stripePublicKey: string;

    @Column({ nullable: true })
    stripeSecretKey: string;

    @Column({ default: 'MXN' })
    defaultCurrency: string;

    @Column('decimal', { precision: 10, scale: 2, default: 49.00 })
    extraStoragePrice: number;

    @Column({ default: 'GB' })
    extraStorageUnit: string;

    @Column({ type: 'json', nullable: true })
    paymentMethods: {
        stripe: { enabled: boolean; config: any };
        paypal: { enabled: boolean; config: any };
        oxxo: { enabled: boolean; card_number: string; account_holder: string; bank: string; enabled_vouchers: boolean };
        ventanilla: { enabled: boolean; details: string };
    };
}
