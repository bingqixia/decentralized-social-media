export class Customer {

    constructor(private _firstName: string, private _lastName: string) {

    }

    public get firstName(): string {
        return this._firstName;
    }
    public set firstName(value: string) {
        this._firstName = value;
    }

    public get lastName(): string {
        return this._lastName;
    }
    public set lastName(value: string) {
        this._lastName = value;
    }

    // special get/set, default public, you can generate by IDE
    // get firstName() {
    //     return this._firstName;
    // }

    // set firstName(value: string) {
    //     this._firstName = value;
    // }

    // get lastName() {
    //     return this._lastName;
    // }

    // set lastName(value: string) {
    //     this._lastName = value;
    // }
}

