export class TodoModel {
    public get rowAssigned(): string {
        return this._rowAssigned;
    }
    public set rowAssigned(value: string) {
        this._rowAssigned = value;
    }
    public get rowDescription(): string {
        return this._rowDescription;
    }
    public set rowDescription(value: string) {
        this._rowDescription = value;
    }
    public get rowNumber(): number {
        return this._rowNumber;
    }
    public set rowNumber(value: number) {
        this._rowNumber = value;
    }
    constructor(private _rowNumber: number, private _rowDescription: string, private _rowAssigned: string) {
        
    }
}