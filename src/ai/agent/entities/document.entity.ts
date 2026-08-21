import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

type DocumentMetadata = Record<string, unknown>;

@Entity()
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    content!: string

    @Column({
        type: 'jsonb',
        default: () => "'{}'::jsonb",
    })
    metadata!: DocumentMetadata;

    @Column('vector', { length: 3072 })
    embedding!: number[]

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;
}