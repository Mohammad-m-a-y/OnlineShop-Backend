import EditSlider from "@/components/admin/sliders/EditSlider";



export default async  function EditSliderPage({ params }) {
  const { id } = await params;


  return (
    <EditSlider sliderId={id} />
  )
  
}