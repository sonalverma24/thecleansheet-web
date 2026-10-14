import { describe, expect, it } from "vitest";
import { babyLens, parseLabelAge } from "./baby-lens";

describe("parseLabelAge", () => {
  it("reads explicit age ranges", () => {
    expect(parseLabelAge("TuCo Kids No-Tear Shampoo, Ages 3-15 - Reetha & Henna")).toEqual({ ageText: "Ages 3 to 15", minAgeMonths: 36 });
    expect(parseLabelAge("Bare Anatomy Junior shampoo for kids from 1 to 12 years")).toEqual({ ageText: "Ages 1 to 12", minAgeMonths: 12 });
  });
  it("treats a plain baby product as from birth (strictest)", () => {
    expect(parseLabelAge("Aveeno Baby Daily Moisture Lotion")).toEqual({ ageText: "Baby", minAgeMonths: 0 });
    expect(parseLabelAge("gentle wash", "suitable from birth")).toEqual({ ageText: "From birth", minAgeMonths: 0 });
  });
  it("returns null when no age is stated", () => {
    expect(parseLabelAge("Hydrating cream")).toEqual({ ageText: null, minAgeMonths: null });
  });
});

describe("babyLens", () => {
  const clean = ["Aqua", "Glycerin", "Avena Sativa (Oat) Kernel Flour", "Cetyl Alcohol", "Allantoin"];

  it("passes a clean list and detects fragrance-free", () => {
    const r = babyLens({ productName: "Aveeno Baby Daily Moisture Lotion", inci: clean });
    expect(r.pass).toBe(true);
    expect(r.fragranceFree).toBe(true);
    expect(r.flags).toEqual([]);
  });

  it("fails on a sensitising preservative", () => {
    const r = babyLens({ productName: "Baby wash", inci: [...clean, "Methylisothiazolinone"] });
    expect(r.pass).toBe(false);
    expect(r.flags[0].severity).toBe("block");
  });

  it("fails menthol for a baby but not for ages 3 and up", () => {
    expect(babyLens({ productName: "Baby balm", inci: [...clean, "Menthol"] }).pass).toBe(false);
    expect(babyLens({ productName: "Kids balm, Ages 3-15", inci: [...clean, "Menthol"] }).pass).toBe(true);
  });

  it("treats a note-level rule as a flag that does not fail the lens", () => {
    const r = babyLens({ productName: "Baby cream", inci: [...clean, "Phenoxyethanol"] });
    expect(r.pass).toBe(true);
    expect(r.flags).toHaveLength(1);
    expect(r.flags[0].severity).toBe("note");
  });

  it("marks a product with fragrance as not fragrance-free", () => {
    expect(babyLens({ productName: "Baby wash", inci: [...clean, "Parfum"] }).fragranceFree).toBe(false);
  });

  it("never passes without an ingredient list", () => {
    expect(babyLens({ productName: "Baby wash", inci: [] }).pass).toBe(false);
  });

  it("judges an unstated age as if for the youngest users", () => {
    expect(babyLens({ productName: "Gentle balm", inci: [...clean, "Eucalyptus Globulus Leaf Oil"] }).pass).toBe(false);
  });
});
