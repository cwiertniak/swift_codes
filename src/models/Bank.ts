import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Country } from "./Country";
import { Branch } from "./Branch";

@Entity("banks")
export class Bank {
    @PrimaryColumn({ length: 11 })
    swiftCode!: string;

    @Column({ length: 200 })
    bankName!: string;

    @Column({ length: 500, nullable: true })
    address!: string;

    @Column({ length: 2 })
    countryISO2!: string;

    @ManyToOne(() => Country, country => country.banks)
    @JoinColumn({ name: "countryISO2" })
    country!: Country;

    @OneToMany(() => Branch, branch => branch.headquarters)
    branches!: Branch[];
}