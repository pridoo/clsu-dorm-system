import { db } from "./firebase";
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  getDocs, 
  writeBatch 
} from "firebase/firestore";

// Optimized Clear Function: Deletes in batches to avoid timeout
const clearCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  if (querySnapshot.empty) return;

  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`--- Cleaned ${collectionName} ---`);
};

export const seedDatabase = async () => {
  try {
    console.log("🧹 Wiping out current data...");
    const collectionsToClear = ["users", "residents", "semesters", "rooms", "allocations"];
    for (const coll of collectionsToClear) {
      await clearCollection(coll);
    }

    console.log("🚀 Starting Fresh Database Seeding...");

    // 1. SEED USERS
    await setDoc(doc(db, "users", "2iI4dK0aAtQ6AvRCFxTUJjG45Y72"), {
      first_name: "Admin",
      middle_name: "",
      last_name: "Alfred",
      email: "admin@clsu.edu.ph",
      role: "admin",
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "users", "0Xff3JWv9NVFtqFSEOHtzpyrqHG3"), {
      first_name: "Alfred",
      middle_name: "",
      last_name: "Cabato",
      email: "cabato.alfred@clsu.edu.ph",
      role: "dorm_manager",
      assigned_building: "Men's Dorm 4 & 5",
      createdAt: serverTimestamp()
    });

    // 2. SEED RESIDENTS
    const residentID = "21-0456";
    await setDoc(doc(db, "residents", residentID), {
      student_id: residentID,
      first_name: "Bea",
      middle_name: "M.",
      last_name: "Santos",
      course: "BSIT",
      year_level: "3rd Year",
      gender: "Female",
      fb_link: "fb.com/beasantos.official",
      contact_number: "09987654321",
      address_street: "Unit 123, Brgy. Bantug",
      address_city: "Science City of Muñoz",
      address_province: "Nueva Ecija",
      mother_first_name: "Maria",
      mother_middle_name: "L.",
      mother_last_name: "Santos",
      mother_contact: "09123456789",
      father_first_name: "Mario",
      father_middle_name: "P.",
      father_last_name: "Santos",
      father_contact: "09123456780",
      guardian_first_name: "Maria",
      guardian_middle_name: "L.",
      guardian_last_name: "Santos",
      guardian_contact: "09987654321",
      isArchived: false,
      createdAt: serverTimestamp()
    });

    // 3. SEED ACTIVE SEMESTER
    const semesterID = "2025-2026-2nd";
    await setDoc(doc(db, "semesters", semesterID), {
      label: "2nd Semester A.Y. 2025-2026",
      status: "active"
    });

    // 4. SEED DORMS & ROOMS (Parallel Execution)
    console.log("🏠 Seeding Rooms (This may take a second)...");
    const dormList = [
      { id: "MD4", group: "Men's Dorm 4 & 5", rooms: 10 }, { id: "MD5", group: "Men's Dorm 4 & 5", rooms: 10 },
      { id: "MD6", group: "Men's Dorm 6 & 7", rooms: 10 }, { id: "MD7", group: "Men's Dorm 6 & 7", rooms: 10 },
      { id: "MD8", group: "Men's Dorm 8 & 9", rooms: 10 }, { id: "MD9", group: "Men's Dorm 8 & 9", rooms: 10 },
      { id: "MD10", group: "Men's Dorm 10 & 11", rooms: 10 }, { id: "MD11", group: "Men's Dorm 10 & 11", rooms: 10 },
      { id: "LD1", group: "Ladies' Dorm 1", rooms: 10 }, { id: "LD2", group: "Ladies' Dorm 2", rooms: 10 },
      { id: "LD3", group: "Ladies' Dorm 3", rooms: 10 }, { id: "LD4", group: "Ladies' Dorm 4", rooms: 10 },
      { id: "LD5", group: "Ladies' Dorm 5 + Annex", rooms: 10 }, { id: "LD5A", group: "Ladies' Dorm 5 + Annex", rooms: 10 },
      { id: "LD6", group: "Ladies' Dorm 6", rooms: 10 }, { id: "LD7", group: "Ladies' Dorm 7 & 8", rooms: 10 },
      { id: "LD8", group: "Ladies' Dorm 7 & 8", rooms: 10 }, { id: "LD9", group: "Ladies' Dorm 9", rooms: 10 },
      { id: "LD10", group: "Ladies' Dorm 10", rooms: 10 }
    ];

    const roomPromises = [];
    for (const dorm of dormList) {
      for (let i = 1; i <= dorm.rooms; i++) {
        const roomID = `${dorm.id}-RM${i}`;
        const roomRef = doc(db, "rooms", roomID);
        roomPromises.push(setDoc(roomRef, {
          room_number: i.toString(),
          dormID: dorm.id,
          dormGroup: dorm.group,
          total_beds: 8,
          occupied_beds: (roomID === "LD5-RM1" ? 1 : 0) 
        }));
      }
    }


    await Promise.all(roomPromises);
    console.log("✅ Rooms Created.");

    // 5. SEED INITIAL ALLOCATION
    console.log("📌 Seeding Allocation...");
    await setDoc(doc(db, "allocations", `${residentID}_${semesterID}`), {
      studentID: residentID,
      roomID: "LD5-RM1",
      dormID: "LD5",
      semesterID: semesterID,
      assignedAt: serverTimestamp(),
      assignedBy: "Alfred Cabato"
    });

    console.log("✨ Seeding Complete!");
    alert("Database Cleaned and Seeded Successfully! 🚀");
  } catch (error: any) {
    console.error("Seeding Error: ", error);
    alert("Error: " + error.message);
  }
};