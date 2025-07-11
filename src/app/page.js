import SecoundaryBar from "@/components/SecoundaryBar";

const bgurl = 'https://random-image-pepebigotes.vercel.app/api/random-image';

export default function Home() {
  return (
    <div
      style={{ backgroundImage: `url(${bgurl})` }}
      className="bg-cover bg-center bg-fixed min-h-screen"
    >
      <SecoundaryBar />
    </div>
  );
}