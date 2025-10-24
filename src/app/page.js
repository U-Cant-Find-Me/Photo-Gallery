import CenterPage from "@/components/CenterPage";
import RenderImages from "@/components/RenderImages";
import SecoundaryBar from "@/components/SecondaryBar";

const bgurl = 'https://picsum.photos/1200/900';

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-fixed" style={{ backgroundImage: `url(${bgurl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="backdrop-blur-sm bg-white/10">
          <SecoundaryBar />
          <div className="max-w-7xl mx-auto px-4 py-12">
            <CenterPage />

            <div className="mt-8 rounded-[12px] shadow-md overflow-hidden">
              <div className="bg-white/90 px-6 py-8">
                <RenderImages />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}