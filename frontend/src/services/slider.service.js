import api from "@/lib/axios";




export async function getSliders() {
  const response = await api.get("/sliders");
  return response.data;
}




export async function createSlider(data) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("display_order", data.display_order);

  if (data.description) { 
    formData.append( "description", data.description );
}

  if (data.link_url) {
     formData.append("link_url", data.link_url);
  }

  if (data.button_text) {
     formData.append( "button_text", data.button_text );
  }

  formData.append("image", data.image);

  const response = await api.post("/sliders",formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
}



export async function updateSlider(sliderId,formData) {
  const response = await api.patch(`/sliders/${sliderId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;

}




export async function toggleSliderStatus(sliderId) {
  const response = await api.patch(`/sliders/${sliderId}/status`);

  return response.data;
}



export async function deleteSlider(sliderId) {
  await api.delete(`/sliders/${sliderId}`);
}