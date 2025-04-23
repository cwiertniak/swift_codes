import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Bank } from "./Bank";

@Entity("countries")
export class Country {
    @PrimaryColumn({ length: 2 })
    iso2!: string;

    @Column({ length: 100 })
    name!: string;

    @OneToMany(() => Bank, bank => bank.country)
    banks!: Bank[];
}