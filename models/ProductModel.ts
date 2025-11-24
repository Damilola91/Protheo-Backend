import mongoose, { Document, Schema } from "mongoose";

const allowedCategories = ["Fertilizzanti", "Terriccio"] as const;
const allowedUnits = ["G/HL", "ML/HL", "KG/HA", "L/HA"] as const;
const allowedPackagingTypes = ["Bag", "Bottle", "Big Bag", "Jerry Can"] as const;

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: (typeof allowedCategories)[number];
    stock: number;
    characteristics: string
    composition: string;
    image: string;
    dosage: {
        cultivation: string;
        notes?: string;
        dosageMin: number;
        dosageMax: number;
        unit: (typeof allowedUnits)[number];
    }[];
      packaging: {
        type: (typeof allowedPackagingTypes)[number];
        icon: string;
        weight?: number; 
        unit?: string;  
    }[];
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
   stock: {
        type: Number,
        required: true,
        min: 1,
    },
    image: {
        type: String,
        required: true,
    },
    composition: {
        type: String,
        required: true,
    },
    characteristics: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: allowedCategories,
        required: true,
    },
    dosage: [{
        cultivation: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            required: false,
        },
        dosageMin: {
            type: Number,
            required: true,
            min: 0,
        },
        dosageMax: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            required: false,
            default: "G/HL",
            enum: allowedUnits,
        },
    }],
    packaging: [
            {
                type: {
                    type: String,
                    enum: allowedPackagingTypes,
                    required: true,
                },
                icon: {
                    type: String,
                    required: true,
                },
                weight: Number,
                unit: String,
            },
        ]
}, {
    timestamps: true,
})

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;