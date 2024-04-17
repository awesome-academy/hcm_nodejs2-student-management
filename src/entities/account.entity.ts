import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { AccountRoles, MAX_LENGTH_30 } from "../common/constants";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: MAX_LENGTH_30, unique: true })
  username: string;

  @Column({ length: MAX_LENGTH_30 })
  password: string;

  @Column({
    type: "enum",
    enum: AccountRoles,
  })
  role: AccountRoles;
}
