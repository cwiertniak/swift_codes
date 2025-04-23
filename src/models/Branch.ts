import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Bank } from "./Bank";
import { Country } from "./Country";

@Entity("branches")
export class Branch {
    @PrimaryColumn({ length: 11 })
    swiftCode!: string;

    @Column({ length: 200 })
    bankName!: string;

    @Column({ length: 500, nullable: true })
    address!: string;

    @Column({ length: 2 })
    countryISO2!: string;

    @Column({ length: 11 })
    headquartersCode!: string;

    @ManyToOne(() => Country)
    @JoinColumn({ name: "countryISO2" })
    country!: Country;

    @ManyToOne(() => Bank, bank => bank.branches)
    @JoinColumn({ name: "headquartersCode", referencedColumnName: "swiftCode" })
    headquarters!: Bank;
}