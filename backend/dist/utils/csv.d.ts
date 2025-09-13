import { CSVImportRow, BuyerCreateInput } from '../types';
export declare const parseCSV: (csvBuffer: Buffer) => Promise<CSVImportRow[]>;
export declare const validateCSVRow: (row: CSVImportRow, rowIndex: number) => {
    isValid: boolean;
    errors: Array<{
        field?: string;
        message: string;
    }>;
    data?: BuyerCreateInput;
};
export declare const generateCSV: (data: any[], filename: string) => Promise<string>;
//# sourceMappingURL=csv.d.ts.map