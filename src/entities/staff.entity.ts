import { Entity, OneToOne, JoinColumn } from "typeorm";
import { Base } from "./base";
import { Account } from "./account.entity";

@Entity()
export class Staff extends Base {
  @OneToOne(() => Account, {cascade: true, onDelete: "CASCADE"})
  @JoinColumn()
  account: Account;
}
