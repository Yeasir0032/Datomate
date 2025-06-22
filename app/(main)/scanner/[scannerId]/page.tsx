import RegistryPage from "@/app/_components/pages/registry-page";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-config";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ScanPage({ params }: { params: any }) {
  const { scannerId } = await params;
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
  const scannerDocRef = doc(db, "Users", userData.uid, "Scanners", scannerId);

  const documnetCollectionRef = collection(scannerDocRef, "Docs");
  const docQSnapshot = await getDocs(documnetCollectionRef);
  let documents: any = [];
  docQSnapshot.forEach((item) => {
    documents.push({ id: item.id, ...item.data() });
  });

  const scannerQSnapshot = await getDoc(scannerDocRef);
  const scannerData = scannerQSnapshot.data();

  return (
    <div>
      <RegistryPage
        scannerId={scannerId}
        userid={userData.uid}
        documents={documents}
        scannerData={scannerData}
      />
    </div>
  );
}
