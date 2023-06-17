import fs from "fs";

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
        const initialAmountUsd = parseFloat(process.env.AMOUNT_USD.replace(",", "."));
        const initialAmountCoin = parseFloat(process.env.AMOUNT_COIN.replace(",", "."));

        return (fs.existsSync(this.filename))
            ? JSON.parse(fs.readFileSync(this.filename).toString(this.encoder))
            : {
                quantity: initialAmountCoin ? initialAmountCoin : 0.00001,
                quoteOrderQty: initialAmountUsd ? initialAmountUsd : 1,
                history: []
            };
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