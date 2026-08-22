import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

type DocumentMetadata = Record<string, unknown>;

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column()
  declare content: string;

  @Column({ type: 'jsonb' })
  declare metadata: DocumentMetadata;

  @Column('vector', { length: 3072 })
  declare embedding: number[];

  @CreateDateColumn()
  declare createdAt: Date;
}
