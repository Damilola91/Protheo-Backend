import mongoose, { Document, Schema } from "mongoose";

export const allowedPackagingTypes = [
  "Bag",
  "Big Bag",
  "Bottle",
  "Jerry Can",
  "Box",
] as const;

export const allowedUnits = ["KG/HA", "G/HL", "ML/HL", "L/HA"] as const;

// INTERFACCIA UFFICIALE PRODOTTO
export interface IProduct extends Document {
  name: string;
  image: string;

  description?: string;
  category?: string;
  technology?: string;

  features?: {
    name: string;
    iconUrl?: string;
    description?: string;
  }[];

  composition?: {
    element: string;
    percentage: number;
  }[];

  dosage?: {
    crop: string;
    min: number;
    max: number;
    unit: (typeof allowedUnits)[number];
    application?: "foliar" | "fertigation" | "soil" | "universal";
  }[];

  packaging?: {
    type: (typeof allowedPackagingTypes)[number];
    weight?: number;
    volume?: number;
    ecoFriendly?: boolean;
    iconUrl?: string;
  }[];

  effects?: {
    plant?: string[];
    flower?: string[];
    soil?: string[];
  };

  stock?: number;
  price?: number;

  // NEW CMS FIELDS
  isPublished?: boolean;
  publishedAt?: Date | null;
  lastEditedBy?: string | mongoose.Types.ObjectId | null;

  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },

    description: String,
    category: String,
    technology: String,

    features: [
      {
        name: { type: String, required: true },
        iconUrl: String,
        description: String,
      },
    ],

    composition: [
      {
        element: String,
        percentage: Number,
      },
    ],

    dosage: [
      {
        crop: String,
        min: Number,
        max: Number,
        unit: { type: String, enum: allowedUnits },
        application: String,
      },
    ],

    packaging: [
      {
        type: { type: String, enum: allowedPackagingTypes },
        weight: Number,
        volume: Number,
        ecoFriendly: Boolean,
        iconUrl: String,
      },
    ],

    effects: {
      plant: [String],
      flower: [String],
      soil: [String],
    },

    stock: Number,
    price: Number,

    //  CMS fields
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
