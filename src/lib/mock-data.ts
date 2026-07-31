// Deterministic demo data used when the backend is unreachable.
// Everything is seeded (no module-level Math.random) so server render,
// hydration, and screenshots stay consistent across reloads.
import type { CareTask, Dog, Incident, Severity, TaskCategory } from "@/types/domain";

// Small deterministic PRNG (mulberry32) for per-dog variance.
function seedRand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  "Bella", "Max", "Luna", "Charlie", "Cooper", "Daisy", "Rocky", "Milo",
  "Sadie", "Bear", "Bailey", "Buster", "Lola", "Duke", "Zoe", "Oliver",
  "Chloe", "Tucker", "Penny", "Jack", "Stella", "Zeus", "Nala", "Murphy",
  "Ruby", "Leo", "Rosie", "Sam", "Winston", "Lulu", "Louie", "Abby",
  "Marley", "Harley", "Gus", "Piper", "Jax", "Coco", "Dexter", "Maya",
  "Bruno", "Lilly", "Shadow", "Sammy", "Dixie"
];
const ZONES = ["A", "B", "C", "D"];
const FEEDING_STATUS: Dog["feedingStatus"][] = ["on_track", "on_track", "on_track", "overdue", "skipped"];
const PORTIONS = ["1 cup", "1.5 cups", "0.75 cup", "2 cups", "1.25 cups"];
const BREEDS = [
  "Golden Retriever",
  "Labrador Retriever",
  "Pembroke Welsh Corgi",
  "Siberian Husky",
  "Beagle",
  "Border Collie",
  "French Bulldog",
  "Shih Tzu",
  "German Shepherd",
  "Australian Shepherd",
  "Poodle",
  "Rottweiler"
];
const DIET_NOTES = [
  "Sensitive stomach — no treats",
  "Slow feeder bowl required",
  "Mixed with wet salmon food",
  "Allergy: chicken & wheat",
  "Standard kibble diet",
  "Medication with breakfast",
];

const DOG_PHOTOS = [
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1534361960057-19889db98b13?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600240644455-3edc55c375fe?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80",
];

export const DOGS: Dog[] = NAMES.map((name, i) => {
  const rand = seedRand(i + 42);
  const photoUrl = DOG_PHOTOS[i % DOG_PHOTOS.length]!;
  return {
    id: `dog_${i + 1}`,
    name,
    ownerId: `owner_${(i % 5) + 1}`,
    zone: ZONES[i % ZONES.length]!,
    activityScore: Math.round(55 + rand() * 42), // 55-97
    feedingStatus: FEEDING_STATUS[i % FEEDING_STATUS.length]!,
    photoUrl,
  };
});

// ~24 hourly readings with realistic morning / midday / evening peaks,
// offset a little per dog so the charts aren't identical.
export function dogTimeline(dogId: string) {
  const rand = seedRand(dogId.split("_")[1] ? Number(dogId.split("_")[1]) : 0);
  const base = [0, 1, 0, 1, 0, 1, 3, 8, 10, 6, 4, 5, 7, 6, 4, 5, 8, 11, 9, 6, 4, 2, 1, 0];
  const boost = Math.round(rand() * 4) - 2;
  return base.map((v, hour) => ({
    hour,
    activity: Math.max(0, v + boost + (hour % 3 === 0 ? Math.round(rand() * 2) : 0)),
  }));
}

export interface FeedingEntry {
  id: string;
  time: string;
  portion: string;
  fed: boolean;
  meal: string;
}

const MEALS: [string, string][] = [
  ["07:30", "Breakfast"],
  ["12:30", "Lunch"],
  ["18:00", "Dinner"],
];

export function dogFeeding(dogId: string) {
  const rand = seedRand(dogId.length * 7 + 13);
  return MEALS.map(([time, meal], i) => {
    // Keep at least breakfast + one other meal fed; vary the remainder.
    const fed = i === 0 ? true : rand() > 0.35;
    return {
      id: `${dogId}_meal_${i}`,
      time,
      portion: PORTIONS[Math.floor(rand() * PORTIONS.length)]!,
      fed,
      meal,
    };
  });
}

export function dogHighlights(dogId: string) {
  const dogIdx = dogId.split("_")[1] ? Number(dogId.split("_")[1]) : 1;
  const rand = seedRand(dogIdx * 17 + 100);
  const count = 6;
  return Array.from({ length: count }).map((_, i) => {
    const hour = 8 + Math.floor(rand() * 11);
    const photoIdx = (dogIdx + i * 3) % DOG_PHOTOS.length;
    return {
      id: `${dogId}_hi_${i}`,
      thumbnailUrl: DOG_PHOTOS[photoIdx]!,
      takenAt: `today ${hour}:${(Math.floor(rand() * 6) * 10).toString().padStart(2, "0")}`,
    };
  });
}

export interface MockAlert {
  id: string;
  severity: Severity;
  type: string;
  message: string;
  dogIds: string[];
  clipUrl?: string;
  createdAt: string;
  acknowledged: boolean;
}

const ALERT_MESSAGES = {
  fight: (d: string, o: string) => `${d} and ${o} showed signs of conflict near the water bowls — separated promptly.`,
  escape: (d: string) => `${d} squeezed past the gate in Zone ${ZONES[0]} — back inside, gate latch replaced.`,
  feeding_overdue: (d: string) => `${d} hasn't been fed yet this shift.`,
  injury: (d: string) => `${d} limping on the right rear leg after play.`,
  quiet: (d: string) => `${d} unusually quiet and withdrawn — monitoring closely.`,
  dig: (d: string) => `${d} began digging under the fence line — spot-check scheduled.`,
};

const ALERT_TYPES: (keyof typeof ALERT_MESSAGES)[] = [
  "fight",
  "escape",
  "feeding_overdue",
  "injury",
  "quiet",
  "dig",
];

const now = Date.now();

export const ALERTS: MockAlert[] = Array.from({ length: 65 }).map((_, i) => {
  const rand = seedRand(i + 7);
  const type = ALERT_TYPES[i % ALERT_TYPES.length]!;
  const dogIdx = i % DOGS.length;
  const otherIdx = (i + 3) % DOGS.length;
  const dog = DOGS[dogIdx]!;
  const other = DOGS[otherIdx]!;
  const severity: Severity =
    type === "fight" || type === "escape"
      ? i % 3 === 0
        ? "critical"
        : "high"
      : type === "injury"
        ? "high"
        : "normal";
  return {
    id: `alert_${i + 1}`,
    severity,
    type,
    message: ALERT_MESSAGES[type](dog.name, other.name),
    dogIds: type === "fight" ? [dog.id, other.id] : [dog.id],
    clipUrl: rand() > 0.5 ? `https://example.com/clips/${type}_${i + 1}.mp4` : undefined,
    createdAt: new Date(now - i * 11 * 60_000 - Math.floor(rand() * 5) * 60_000).toISOString(),
    acknowledged: i > 12,
  };
});

export const MY_DOGS = DOGS.map(({ id, name, zone, photoUrl, feedingStatus }) => ({ id, name, zone, photoUrl, feedingStatus }));

export const COMPLIANCE = [
  { id: "c1", label: "AM — Visual health check", shift: "morning", completed: true },
  { id: "c2", label: "AM — Fresh water refilled", shift: "morning", completed: true },
  { id: "c3", label: "AM — Kennel sanitized", shift: "morning", completed: true },
  { id: "c4", label: "PM — Yard clean & hazards cleared", shift: "afternoon", completed: false },
  { id: "c5", label: "PM — Walk log reviewed", shift: "afternoon", completed: false },
  { id: "c6", label: "PM — Medication administered", shift: "afternoon", completed: false },
  { id: "c7", label: "EVE — Lights & kennels secured", shift: "evening", completed: false },
  { id: "c8", label: "EVE — Bedding & temperature check", shift: "evening", completed: false },
] as const;

export interface FullDogProfile extends Dog {
  breed: string;
  ageYears: number;
  weightKg: number;
  diet: string;
  microchipId: string;
  ownerName: string;
  ownerPhone: string;
  vetName: string;
  emergencyContact: string;
  allergies: string[];
  medicalNotes: string;
  vaccinations: string[];
  groomingSchedule: string;
  favoriteActivity: string;
  behaviorStatus: "Playful & Social" | "Calm & Gentle" | "High Energy" | "Reserved / Needs Space";
}

const OWNER_NAMES = [
  "Sarah Jenkins", "Michael Chang", "Emily Rodriguez", "David Miller", "Jessica Taylor",
  "James Wilson", "Amanda Martinez", "Robert Anderson", "Ashley Thomas", "William White"
];

const VET_CLINICS = [
  "Paws & Claws Veterinary Hospital", "Metro City Animal Care Center",
  "Sunnyside Pet Health Clinic", "Companion Animal Hospital", "Oakwood Veterinary Clinic"
];

const ALLERGIES_LIST = [
  ["Chicken", "Wheat"], ["Beef"], ["Dairy", "Soy"], ["Flea bite hypersensitivity"],
  ["Dust mites"], ["Corn"], ["Pollen"], ["None (No known allergies)"]
];

const MEDICAL_NOTES = [
  "Up to date on Rabies & DHPP. Mild hip dysplasia — avoid high agility leaps.",
  "Fully vaccinated. Requires daily ear cleaning after yard play.",
  "Spayed/Neutered. Annual dental checkup scheduled for next month.",
  "Sensitive skin — uses hypoallergenic shampoo during grooming.",
  "Takes glucosamine chew with morning breakfast for joint health.",
  "Excellent health. Microchip verified during check-in."
];

const VACCINATIONS_LIST = [
  ["Rabies (Active)", "DHPP (Active)", "Bordetella (Active)"],
  ["Rabies (Active)", "DHPP (Active)", "Lyme (Active)"],
  ["Rabies (Active)", "Bordetella (Active)", "Leptospirosis (Active)"]
];

const GROOMING_SCHEDULES = [
  "Every 2 weeks (Bath & Nails)",
  "Monthly Full Grooming",
  "Weekly Brushing & Ear Cleaning",
  "Every 3 weeks (Coat Trim & Paw Pad Care)"
];

const FAVORITE_ACTIVITIES = [
  "Agility Obstacle Course & Frisbee Fetch",
  "Supervised Pack Yard Play & Splash Pool",
  "Gentle Sunbathing & Scent Tracking",
  "Tennis Ball Fetch & Tug-of-War"
];

const BEHAVIOR_STATUSES: FullDogProfile["behaviorStatus"][] = [
  "Playful & Social",
  "Calm & Gentle",
  "High Energy",
  "Reserved / Needs Space"
];

export function dogProfile(dogId: string): FullDogProfile {
  const dog = DOGS.find((d) => d.id === dogId) ?? DOGS[0]!;
  const numKey = Number(dogId.replace(/\D/g, "") || "1");

  return {
    ...dog,
    breed: BREEDS[numKey % BREEDS.length]!,
    ageYears: 1 + (numKey % 10),
    weightKg: 6 + (numKey % 28),
    diet: DIET_NOTES[numKey % DIET_NOTES.length]!,
    microchipId: `98514100${(8000 + numKey * 37).toString().padStart(4, "0")}`,
    ownerName: OWNER_NAMES[numKey % OWNER_NAMES.length]!,
    ownerPhone: `+1 (555) ${(200 + (numKey * 13) % 700).toString().padStart(3, "0")}-${(1000 + (numKey * 89) % 8999).toString().padStart(4, "0")}`,
    vetName: VET_CLINICS[numKey % VET_CLINICS.length]!,
    emergencyContact: `+1 (555) ${(300 + (numKey * 17) % 600).toString().padStart(3, "0")}-${(1000 + (numKey * 43) % 8999).toString().padStart(4, "0")}`,
    allergies: ALLERGIES_LIST[numKey % ALLERGIES_LIST.length]!,
    medicalNotes: MEDICAL_NOTES[numKey % MEDICAL_NOTES.length]!,
    vaccinations: VACCINATIONS_LIST[numKey % VACCINATIONS_LIST.length]!,
    groomingSchedule: GROOMING_SCHEDULES[numKey % GROOMING_SCHEDULES.length]!,
    favoriteActivity: FAVORITE_ACTIVITIES[numKey % FAVORITE_ACTIVITIES.length]!,
    behaviorStatus: BEHAVIOR_STATUSES[numKey % BEHAVIOR_STATUSES.length]!,
  };
}

export interface CareTaskTemplate {
  title: string;
  category: TaskCategory;
  scheduledTime: string;
  notes?: string;
}

const CARE_TASK_TEMPLATES: CareTaskTemplate[] = [
  { title: "Breakfast portion", category: "feeding", scheduledTime: "07:30", notes: "Weigh portion per diet plan" },
  { title: "Morning medication", category: "medication", scheduledTime: "07:45", notes: "Give with food" },
  { title: "Morning walk", category: "walk", scheduledTime: "08:30", notes: "On-leash, 20 min" },
  { title: "Grooming brush", category: "grooming", scheduledTime: "10:00", notes: "Check ears & coat" },
  { title: "Lunch portion", category: "feeding", scheduledTime: "12:30" },
  { title: "Playtime & enrichment", category: "playtime", scheduledTime: "14:30", notes: "Rotate toy / puzzle feeder" },
  { title: "Afternoon walk", category: "walk", scheduledTime: "16:30" },
  { title: "Dinner portion", category: "feeding", scheduledTime: "18:00" },
  { title: "Evening playtime", category: "playtime", scheduledTime: "19:30", notes: "Quiet wind-down session" },
];

const CARE_STAFF = ["Jordan", "Casey", "Riley", "Morgan"];

// Deterministic per-dog daily care checklist. Skips a category here and there so
// the board isn't identical for every dog, and marks earlier tasks mostly done.
export function dogCareTasks(dogId: string): CareTask[] {
  const dog = DOGS.find((d) => d.id === dogId) ?? DOGS[0]!;
  const numKey = Number(dogId.replace(/\D/g, "") || "1");
  const rand = seedRand(numKey * 7 + 31);

  const skipMedication = numKey % 3 === 0;
  const skipGrooming = numKey % 4 === 0;
  // Deterministic reference time (12:30) keeps completed/pending stable across reloads.
  const refMinutes = 12 * 60 + 30;

  const tasks: CareTask[] = [];
  CARE_TASK_TEMPLATES.forEach((tpl, i) => {
    if (tpl.category === "medication" && skipMedication) return;
    if (tpl.category === "grooming" && skipGrooming) return;

    const [h, m] = tpl.scheduledTime.split(":").map(Number);
    const scheduledMinutes = h! * 60 + m!;
    const completed = rand() < (scheduledMinutes <= refMinutes ? 0.9 : 0.15);

    tasks.push({
      id: `${dog.id}_task_${i}`,
      dogId: dog.id,
      title: tpl.title,
      category: tpl.category,
      scheduledTime: tpl.scheduledTime,
      completed,
      completedAt: completed ? `today ${tpl.scheduledTime}` : undefined,
      completedBy: completed ? CARE_STAFF[Math.floor(rand() * CARE_STAFF.length)]! : undefined,
      notes: tpl.notes,
    });
  });

  return tasks;
}

// ---- Manager & facility-wide data ----

export interface TrendPoint {
  day: string;
  incidents: number;
  compliance: number;
}

export function incidentTrend(): TrendPoint[] {
  const rand = seedRand(77);
  return Array.from({ length: 14 }).map((_, i) => ({
    day: `D-${14 - i}`,
    incidents: Math.max(1, Math.round(2 + rand() * 5 + Math.sin(i / 1.7) * 2)),
    compliance: Math.min(99, Math.max(86, Math.round(92 + rand() * 6 - (i % 3)))),
  }));
}

const INCIDENT_NOTES = [
  "Separation incident, monitor closely.",
  "Routine check — no concerns.",
  "Dog fought during supervised play, both separated.",
  "Escaped the yard via a gap, recovered within minutes.",
  "Ate something off the ground, vet advised observation.",
  "Minor paw scrape, cleaned and bandaged.",
  "Excessive digging near the fence line, spot-check scheduled.",
];

export function incidents(): Incident[] {
  return Array.from({ length: 60 }).map((_, i) => {
    const rand = seedRand(i + 900);
    const dog = DOGS[i % DOGS.length]!;
    const other = DOGS[(i + 3) % DOGS.length]!;
    const resolved = rand() < 0.7;
    const severity: Severity =
      rand() < 0.12 ? "critical" : rand() < 0.35 ? "high" : "normal";
    const minutesAgo = 8 + Math.floor(rand() * (60 * 24 * 14));
    return {
      id: `inc_${i + 1}`,
      alertId: `a_${i + 1}`,
      dogIds: rand() < 0.15 ? [dog.id, other.id] : [dog.id],
      notes: INCIDENT_NOTES[i % INCIDENT_NOTES.length]!,
      resolved,
      createdAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      severity,
      dogName: dog.name,
      minutesAgo,
    };
  });
}

export interface ZoneOccupancy {
  zone: string;
  current: number;
  capacity: number;
}

export function zoneOccupancy(): ZoneOccupancy[] {
  return ZONES.map((z, i) => {
    const rand = seedRand(i + 200);
    const capacity = 18 + i * 6; // 18, 24, 30, 36
    const current = Math.round(4 + rand() * (capacity - 4));
    return { zone: z, current, capacity };
  });
}
