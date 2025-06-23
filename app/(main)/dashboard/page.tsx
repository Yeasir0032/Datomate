import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import HomePage from "@/app/_components/pages/home";

export default async function Dashboard() {
  const fetchUserData = async () => {
    try {
      const cookieStore = await cookies();

      const userToken = cookieStore.get("authToken")?.value;
      if (!userToken) {
        redirect("/auth/login");
      } else {
        const decodedClaims = await adminAuth.verifySessionCookie(
          userToken,
          true
        );
        return { email: decodedClaims.email, uid: decodedClaims.uid };
      }
    } catch (error) {
      return null;
    }
  };
  const userData = await fetchUserData();
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800  p-8 rounded-lg shadow-lg text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Internet Connection
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Looks like you're offline. Please check your internet connection and
            try again.
          </p>
        </div>
      </div>
    );
  }
  const usersCollectionRef = doc(db, "Users", userData.uid);
  // const exploreDocRef = doc(db, "Explore", "A8yQHK9Y5Od4ePeASqCS");
  // const dat = [
  //   { name: "name", type: "text" },
  //   { name: "company-name", type: "text" },
  //   {
  //     name: "address",
  //     type: "object",
  //     children: [
  //       { name: "street", type: "text" },
  //       { name: "city", type: "text" },
  //       { name: "state", type: "text" },
  //       { name: "zipcode", type: "text" },
  //       { name: "country", type: "text" },
  //     ],
  //   },
  //   {
  //     name: "contact",
  //     type: "object",
  //     children: [
  //       { name: "mobile", type: "phone" },
  //       { name: "email", type: "email" },
  //       { name: "website", type: "url" },
  //     ],
  //   },
  //   { name: "notes", type: "text" },
  // ];

  // await updateDoc(exploreDocRef, { fields: dat });
  const exploreCollectionRef = collection(db, "Explore");
  const exploreSnapshot = await getDocs(exploreCollectionRef);
  let exploreData: any = [];
  exploreSnapshot.forEach((item) => {
    exploreData.push({ id: item.id, ...item.data() });
  });
  const userSnapShot = await getDoc(usersCollectionRef);
  const userDataScans: any = userSnapShot.data();
  const scannerCollectionRef = collection(usersCollectionRef, "Scanners");
  const querySnapshot = await getDocs(scannerCollectionRef);
  let scannerData: any = [];
  querySnapshot.forEach((item) => {
    scannerData.push({ id: item.id, ...item.data() });
  });
  return (
    <div>
      <HomePage
        scannerData={scannerData}
        exploreData={exploreData}
        uid={userData.uid}
        userscans={userDataScans.totalscans}
      />
    </div>
  );
}
