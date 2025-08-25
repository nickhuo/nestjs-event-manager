import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

export enum EventStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type:
      process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
        ? 'varchar'
        : 'enum',
    enum:
      process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
        ? undefined
        : EventStatus,
    default: EventStatus.TODO,
    length:
      process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
        ? 20
        : undefined,
  })
  status: EventStatus;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.events, {
    cascade: true,
  })
  @JoinTable({
    name: 'event_invitees',
    joinColumn: {
      name: 'eventId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  invitees: User[];
}
