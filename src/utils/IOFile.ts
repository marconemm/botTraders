import fs from "fs";
import { Enums } from "./enums";

export class IOFile {
    private readonly encoder: BufferEncoding;
    private readonly filename: string;

    constructor(filename: string, encoder: BufferEncoding) {
        this.encoder = encoder;
        this.filename = filename;
    }

    createFile(data: any = undefined) {
        try {
            if (data) {
                fs.writeFileSync(this.filename, JSON.stringify(data, null, 2))
            }
            else {
                throw new Error("Please, inform the \"data\" parameter.");
            }
        } catch (erro) {
            console.error(erro);

        }
    }

    readFile() {
        return (fs.existsSync(this.filename))
            ? JSON.parse(fs.readFileSync(this.filename).toString(this.encoder))
            : {};
    }

    updateFile(data: any = undefined) {
        const updatedData = { ...this.readFile(), ...data };

        this.createFile(updatedData);
    }

    deleteFile() {
        if (fs.existsSync(this.filename)) {
            fs.rmSync(this.filename);
            console.log(`Arquivo "${this.filename}" removido com sucesso.`);
        }
    }
}