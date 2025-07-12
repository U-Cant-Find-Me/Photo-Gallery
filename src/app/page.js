import SecoundaryBar from "@/components/SecoundaryBar";

const bgurl = 'https://random-image-pepebigotes.vercel.app/api/random-image';

export default function Home() {
  return (
    <div className="bg-cover bg-center bg-fixed min-h-screen"
      style={{ backgroundImage: `url(${bgurl})` }}
    >
      <SecoundaryBar />
    </div>
  );
}