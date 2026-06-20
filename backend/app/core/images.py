from fastapi import HTTPException, UploadFile
from pathlib import Path
import uuid
import os
import aiofiles 
from typing import Literal



BASE_UPLOAD_DIR = Path("uploads")
TEMP_DIR_URL = Path("uploads/temp")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}



def get_valid_filename_extension(filename: str) -> str | None:

    """
    Checks and returns the valid file extension.
    """

    ext = Path(filename).suffix.lower()
    if ext in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        return ext
    return None



def create_unique_filename(filename_extension: str) -> str:

    """
    Generates a unique filename using UUID.
    """

    return f"{uuid.uuid4().hex}{filename_extension}"




# ----- manage file saving destination-----



def get_base_upload_directory() -> Path:
    """
    Returns the base upload directory and creates it if it doesn't exist.
    """
    BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return BASE_UPLOAD_DIR

def get_temp_upload_directory() -> Path:
    """
    Returns the temporary directory path and creates it if it doesn't exist.
    """
    temp_dir = BASE_UPLOAD_DIR / "temp"
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir

def get_user_upload_directory(user_id: int) -> Path:
    """
    Creates and returns the final storage path for user profile pictures based on user_id.
    """
    user_dir = BASE_UPLOAD_DIR / "users" / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir

def get_product_upload_directory(product_id: int) -> Path:
    """
    Creates and returns the final storage path for product images based on product_id.
    """
    product_dir = BASE_UPLOAD_DIR / "products" / str(product_id)
    product_dir.mkdir(parents=True, exist_ok=True)
    return product_dir


def get_category_upload_directory(category_id:int) -> Path:
    category_dir = BASE_UPLOAD_DIR / "categories" / str(category_id)
    category_dir.mkdir(parents=True, exist_ok=True)
    return category_dir


def get_brand_upload_directory(brand_id:int) -> Path:
    brand_dir = BASE_UPLOAD_DIR / "brands" / str(brand_id)
    brand_dir.mkdir(parents=True, exist_ok=True)
    return brand_dir


def get_slider_upload_directory(slider_id:int) -> Path:
    slider_dir = BASE_UPLOAD_DIR / "sliders" / str(slider_id)
    slider_dir.mkdir(parents=True, exist_ok=True)
    return slider_dir


# ---------------------------------------


async def save_upload_file_to_temp(upload_file: UploadFile, temp_dir: Path) -> Path | None:
    """
    Saves the uploaded file temporarily to the specified path asynchronously.

    Args:
        upload_file: UploadFile object from FastAPI.
        temp_dir: The temporary directory path for saving.

    Returns:
        The final path of the temporarily saved file, or None if an error occurred.
    """
    try:
   
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        file_extension = get_valid_filename_extension(upload_file.filename)
        if not file_extension:
            return None  

        unique_filename = create_unique_filename(file_extension)
        temp_file_path = temp_dir / unique_filename


    
        async with aiofiles.open(temp_file_path, "wb") as buffer:
        
            while chunk := await upload_file.read(8192):  # Read in 8KB chunks
                await buffer.write(chunk)

            return temp_file_path
        
    except Exception as e:
        print(f"Error saving temp file: {e}")
        # Clean up partially saved file if error occurs
        if 'temp_file_path' in locals() and temp_file_path.exists():
            try:
                os.remove(temp_file_path)
            except Exception as cleanup_e:
                print(f"Error during cleanup of partial temp file {temp_file_path}: {cleanup_e}")
        return None
    


def validate_image_type(content_type: str) -> bool:
    """
    Validates the file's content type.
    """
    return content_type in ALLOWED_IMAGE_TYPES




async def move_file_to_final_destination(
    source_path: Path, 
    destination_dir: Path, 
    final_filename: str
) -> Path:
    """
    Asynchronously moves the file from the source path to the final destination.

    Args:
        source_path: Path to the temporary file.
        destination_dir: The final destination directory.
        final_filename: The filename in the final destination.

    Returns:
        The path of the finally moved file.

    Raises:
        HTTPException: If file moving fails.
    """
    destination_dir.mkdir(parents=True, exist_ok=True)
    final_path = destination_dir / final_filename
    
    try:
        async with aiofiles.open(source_path, 'rb') as src_f, \
                   aiofiles.open(final_path, 'wb') as dest_f:
            while chunk := await src_f.read(8192):
                await dest_f.write(chunk)
        
        # After successful copy, remove the source file
        os.remove(source_path) # os.remove is sync, but fast for small temp files. For very large files consider async alternatives if available or profile performance.
        return final_path
    except Exception as e:
        print(f"Error moving file: {e}")
        # Clean up destination file if it was partially created
        if final_path.exists():
            try:
                os.remove(final_path)
            except Exception as cleanup_e:
                print(f"Error during cleanup of partial destination file {final_path}: {cleanup_e}")
        raise HTTPException(status_code=500, detail="Failed to move file to final destination.")
    




def delete_file(file_path: Path):

    """
    Deletes a file if it exists. Handles potential errors.
    (This function remains synchronous as file deletion is typically fast and simple)
    """

    try:
        if file_path.exists():
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting temp file {file_path}: {e}")



# --- Main Save Image Function ---


async def save_image(
    upload_file: UploadFile,
    destination_type: Literal["user", "product","category","brand","slider"], 
    destination_id: int, 
) -> Path:
    """
    Receives, validates, temporarily saves, and moves an image file to its final destination asynchronously.

    Args:
        upload_file: UploadFile object from FastAPI.
        destination_type: The type of entity the file belongs to ('user', 'product', etc.).
        destination_id: The ID of the entity (user_id, product_id, etc.).

    Returns:
        The final path of the saved file.

    Raises:
        HTTPException: If any error occurs during validation, saving, or moving.
    """

    if not validate_image_type(upload_file.content_type):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

  
    file_extension = get_valid_filename_extension(upload_file.filename)
    if not file_extension:
        raise HTTPException(status_code=400, detail="Unsupported file extension.")
    
    # Use the global TEMP_DIR_URL defined at the top
    temp_file_path = await  save_upload_file_to_temp(upload_file, TEMP_DIR_URL)
    if not temp_file_path:
        raise HTTPException(status_code=500, detail="Failed to save uploaded file temporarily.")


    final_destination_dir: Path
    final_filename: str
    if destination_type == "user":
        final_destination_dir = get_user_upload_directory(destination_id)
        final_filename = f"avatar{file_extension}" 
    elif destination_type == "product":
        final_destination_dir = get_product_upload_directory(destination_id)
        final_filename = f"product_img_{uuid.uuid4().hex}{file_extension}"
    elif destination_type == "category":
        final_destination_dir = get_category_upload_directory(destination_id)
        final_filename = f"category_img{file_extension}"
    elif destination_type == "brand":
        final_destination_dir = get_brand_upload_directory(destination_id)
        final_filename = f"brand_img{file_extension}"
    elif destination_type == "slider":
        final_destination_dir = get_slider_upload_directory(destination_id)
        final_filename = f"slider_img{file_extension}"

    else:

        delete_file(temp_file_path) 
        raise HTTPException(status_code=400, detail="Invalid destination type.")


    final_file_path = None
    try:
        final_file_path = await move_file_to_final_destination(
            source_path=temp_file_path,
            destination_dir=final_destination_dir,
            final_filename=final_filename
        )

        delete_file(temp_file_path) 
        
        return final_file_path
        
    except Exception as e:

        delete_file(temp_file_path)
        raise e
