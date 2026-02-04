import { db } from "./firebase";
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";

// Function para linisin ang database bago mag-seed
const clearCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};

export const seedDatabase = async () => {
  try {
    console.log("🧹 Wiping out current data...");
    const collectionsToClear = ["users", "residents", "semesters", "rooms", "allocations"];
    for (const coll of collectionsToClear) {
      await clearCollection(coll);
    }

    console.log("🚀 Starting Fresh Database Seeding...");

    // 1. SEED USERS (Using your specific IDs)
    await setDoc(doc(db, "users", "2iI4dK0aAtQ6AvRCFxTUJjG45Y72"), {
      first_name: "Admin", middle_name: "", last_name: "Alfred",
      email: "admin@clsu.edu.ph", role: "admin", createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "users", "0Xff3JWv9NVFtqFSEOHtzpyrqHG3"), {
      first_name: "Alfred", middle_name: "", last_name: "Cabato",
      email: "cabato.alfred@clsu.edu.ph", role: "dorm_manager", assigned_building: "Men's Dorm 4 & 5", createdAt: serverTimestamp()
    });

    // 2. SEED SAMPLE RESIDENT (For Retention Test)
    await setDoc(doc(db, "residents", "21-0456"), {
      first_name: "Bea", middle_name: "M.", last_name: "Santos",
      course: "BSIT", yearLevel: "3rd Year", gender: "Female",
      guardian_name: "Maria Santos", guardian_contact: "09987654321",
      isArchived: false
    });

    // 3. SEED ACTIVE SEMESTER
    await setDoc(doc(db, "semesters", "2025-2026-2nd"), {
      label: "2nd Semester A.Y. 2025-2026", status: "active"
    });

    // 4. SEED DORMS & ROOMS (Based on Handbook Groupings)
    const dormList = [
      // Men's Dorms
      { id: "MD4", group: "Men's Dorm 4 & 5", rooms: 10 },
      { id: "MD5", group: "Men's Dorm 4 & 5", rooms: 10 },
      { id: "MD6", group: "Men's Dorm 6 & 7", rooms: 10 },
      { id: "MD7", group: "Men's Dorm 6 & 7", rooms: 10 },
      { id: "MD8", group: "Men's Dorm 8 & 9", rooms: 10 },
      { id: "MD9", group: "Men's Dorm 8 & 9", rooms: 10 },
      { id: "MD10", group: "Men's Dorm 10 & 11", rooms: 10 },
      { id: "MD11", group: "Men's Dorm 10 & 11", rooms: 10 },
      
      // Ladies' Dorms
      { id: "LD1", group: "Ladies' Dorm 1", rooms: 10 },
      { id: "LD2", group: "Ladies' Dorm 2", rooms: 10 },
      { id: "LD3", group: "Ladies' Dorm 3", rooms: 10 },
      { id: "LD4", group: "Ladies' Dorm 4", rooms: 10 },
      { id: "LD5", group: "Ladies' Dorm 5 + Annex", rooms: 10 },
      { id: "LD5A", group: "Ladies' Dorm 5 + Annex", rooms: 10 },
      { id: "LD6", group: "Ladies' Dorm 6", rooms: 10 },
      { id: "LD7", group: "Ladies' Dorm 7 & 8", rooms: 10 },
      { id: "LD8", group: "Ladies' Dorm 7 & 8", rooms: 10 },
      { id: "LD9", group: "Ladies' Dorm 9", rooms: 10 },
      { id: "LD10", group: "Ladies' Dorm 10", rooms: 10 }
    ];

    for (const dorm of dormList) {
      for (let i = 1; i <= dorm.rooms; i++) {
        const roomID = `${dorm.id}-RM${i}`;
        await setDoc(doc(db, "rooms", roomID), {
          room_number: i.toString(),
          dormID: dorm.id,
          dormGroup: dorm.group,
          total_beds: 8,
          occupied_beds: (roomID === "MD4-RM1" ? 1 : 0) // Si Bea ay nasa MD4-RM1
        });
      }
    }

    // 5. SEED INITIAL ALLOCATION
    await setDoc(doc(db, "allocations", "21-0456_2025-2026-2nd"), {
      studentID: "21-0456",
      roomID: "MD4-RM1",
      dormID: "MD4",
      semesterID: "2025-2026-2nd",
      assignedAt: serverTimestamp(),
      assignedBy: "Alfred Cabato"
    });

    alert("Database Cleaned and Seeded Successfully! 🚀");
  } catch (error: any) {
    console.error("Seeding Error: ", error);
    alert("Error: " + error.message);
  }
};