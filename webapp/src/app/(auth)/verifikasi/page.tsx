import VerifikasiForm from "./VerifikasiForm";

export default async function VerifikasiPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return <VerifikasiForm token={token} />;
}
