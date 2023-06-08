export class BingXBot {
    private hasOrder: boolean

    constructor() {
        this.hasOrder = false;
    }

    evaluateTradeResponse(response: any) {
        console.log(response);

    }
}