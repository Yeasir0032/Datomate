import { cookies } from "next/headers";
import HomePage from "./_components/pages/home";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-config";
import { collection, doc, getDocs } from "firebase/firestore";

export default async function Home() {
  const fetchUserData = async () => {
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
  };
  const userData = await fetchUserData();
  const usersCollectionRef = doc(db, "Users", userData.uid);
  const scannerCollectionRef = collection(usersCollectionRef, "Scanners");
  const querySnapshot = await getDocs(scannerCollectionRef);
  let scannerData: any = [];
  querySnapshot.forEach((item) => {
    scannerData.push({ id: item.id, ...item.data() });
  });
  return (
    <div>
      <HomePage scannerData={scannerData} />
    </div>
  );
}
