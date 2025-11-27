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
// ──────────────────────────────────────────────────────────
export interface IProduct extends Document {
  name: string;
  image: string;

  description?: string;
  category?: string;
  technology?: string; // esempio: "DOS-PE", "Chelato EDDHA" ecc.

  // FEATURES = ICONS  ✔ (richiesta)
  features?: {
    name: string; // es. "slow release"
    iconUrl?: string; // svg/png (non obbligatoria)
    description?: string; // se vuoi spiegazione testuale
  }[];

  // COMPOSIZIONE — OPZIONALE ✔
  composition?: {
    element: string; // es. "N", "Fe", "SO3", "P2O5"
    percentage: number;
  }[];

  // DOSAGGI — OPZIONALE ✔
  dosage?: {
    crop: string; // Kiwi, Vite, Agrumi, Cereali...
    min: number;
    max: number;
    unit: (typeof allowedUnits)[number];
    application?: "foliar" | "fertigation" | "soil" | "universal";
  }[];

  // PACKAGING — ARRAY ✔
  packaging?: {
    type: (typeof allowedPackagingTypes)[number];
    weight?: number; // kg
    volume?: number; // L
    ecoFriendly?: boolean;
    iconUrl?: string;
  }[];

  // EFFETTI SUDDIVISI PER AREA — AGGIUNTO ✔
  effects?: {
    plant?: string[]; // lignificazione, metabolismo ecc.
    flower?: string[]; // qualità fiori, gemme ecc.
    soil?: string[]; // attività microbiologica ecc.
  };

  // DATI COMMERCIALI
  stock?: number;
  price?: number;

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
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
