import mongoose, { Model, Schema } from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const nonEmptyString = (value: string): boolean => value.trim().length > 0;

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeDateToISO = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date. Use a valid date value.");
  }

  // Persist date in canonical ISO date format (YYYY-MM-DD).
  return parsed.toISOString().split("T")[0];
};

const normalizeTime = (value: string): string => {
  const input = value.trim().toLowerCase();
  const twentyFourHourMatch = input.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

  if (twentyFourHourMatch) {
    const hours = twentyFourHourMatch[1].padStart(2, "0");
    return `${hours}:${twentyFourHourMatch[2]}`;
  }

  const twelveHourMatch = input.match(/^([1-9]|1[0-2]):([0-5]\d)\s?(am|pm)$/);
  if (!twelveHourMatch) {
    throw new Error("Invalid time. Use HH:mm or h:mm am/pm format.");
  }

  const hour = Number(twelveHourMatch[1]);
  const minute = twelveHourMatch[2];
  const period = twelveHourMatch[3];
  const convertedHour =
    period === "pm" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;

  return `${String(convertedHour).padStart(2, "0")}:${minute}`;
};

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, validate: nonEmptyString },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true, validate: nonEmptyString },
    overview: { type: String, required: true, trim: true, validate: nonEmptyString },
    image: { type: String, required: true, trim: true, validate: nonEmptyString },
    venue: { type: String, required: true, trim: true, validate: nonEmptyString },
    location: { type: String, required: true, trim: true, validate: nonEmptyString },
    date: { type: String, required: true, trim: true, validate: nonEmptyString },
    time: { type: String, required: true, trim: true, validate: nonEmptyString },
    mode: { type: String, required: true, trim: true, validate: nonEmptyString },
    audience: { type: String, required: true, trim: true, validate: nonEmptyString },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => item.trim().length > 0),
        message: "Agenda must contain at least one non-empty item.",
      },
    },
    organizer: { type: String, required: true, trim: true, validate: nonEmptyString },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => item.trim().length > 0),
        message: "Tags must contain at least one non-empty item.",
      },
    },
  },
  { timestamps: true }
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function (next) {
  // Enforce non-empty required string fields at save time.
  const requiredTextFields: Array<keyof IEvent> = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredTextFields) {
    const value = this[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      return next(new Error(`Field "${field}" is required and cannot be empty.`));
    }
  }

  if (!Array.isArray(this.agenda) || this.agenda.length === 0 || this.agenda.some((item) => item.trim().length === 0)) {
    return next(new Error('Field "agenda" must contain at least one non-empty item.'));
  }

  if (!Array.isArray(this.tags) || this.tags.length === 0 || this.tags.some((item) => item.trim().length === 0)) {
    return next(new Error('Field "tags" must contain at least one non-empty item.'));
  }

  // Regenerate slug only when title changes (or slug is missing).
  if (this.isModified("title") || !this.slug) {
    this.slug = toSlug(this.title);
  }

  // Normalize date and time to stable storage formats.
  try {
    this.date = normalizeDateToISO(this.date);
    this.time = normalizeTime(this.time);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid date or time.";
    return next(new Error(message));
  }

  return next();
});

const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", eventSchema);

export default Event;
