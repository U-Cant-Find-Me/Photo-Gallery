import CenterPage from "@/components/CenterPage";
import RenderImages from "@/components/RenderImages";
import SecoundaryBar from "@/components/SecondaryBar";

const bgurl = 'https://picsum.photos/1440/900';

export default function Home() {
  return (
    <>
      <div className="bg-cover bg-center bg-fixed min-h-screen"
        style={{ backgroundImage: `url(${bgurl})` }}
      >
        <SecoundaryBar />
        <CenterPage />
        <div className="bg-white">
          <RenderImages />
        </div>
      </div>
    </>
  );
}