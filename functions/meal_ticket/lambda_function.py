import random
from random import randint
import string
import qrcode
import os
import logging
import time

import boto3
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

logging.basicConfig()
profile_name='DE_ADMIN'
boto3.setup_default_session(profile_name=profile_name)

event_table_name     = os.environ.get("EVENT_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel("INFO")

db = boto3.resource('dynamodb')
event_table = db.Table(event_table_name)

def save_tickets_to_dynamodb(ticket_numbers):
    """
    Save a batch of ticket numbers to DynamoDB.
    """
    try:
        with event_table.batch_writer() as batch:
            for ticket_number in ticket_numbers:
                current_time = int(time.time())
                batch.put_item(
                    Item={
                        'PK': f"DINNERTICKET#{ticket_number}",
                        'SK': f"DETAL#{current_time}",
                        'active': True,
                        'used_at': None,
                        'timestamp':current_time
                        'history': []
                    }
                )
        print(f"Batch of {len(ticket_numbers)} ticket numbers saved to DynamoDB.")
    except Exception as e:
        print(f"Error saving batch to DynamoDB: {e}")


def extract_named_font_style(font_path, target_name):
    """
    Extracts a named font style (e.g., 'AcuminVF-BoldItalic') from a variable font file.
    
    Args:
        font_path (str): Path to the variable font file (e.g., .otf or .ttf).
        target_name (str): The exact name of the font style to extract (e.g., 'AcuminVF-BoldItalic').
        
    Returns:
        dict: A dictionary containing details of the target font style, including its nameID and other metadata.
    """
    font = TTFont(font_path)
    name_table = font["name"]  # Access the 'name' table, which contains naming records
    
    extracted_info = []
    
    # Iterate through the name records
    for record in name_table.names:
        if target_name in str(record.string, encoding='utf-16-be', errors='ignore'):
            extracted_info.append({
                "nameID": record.nameID,
                "platformID": record.platformID,
                "languageID": record.langID,
                "font_style_name": str(record.string, encoding='utf-16-be', errors='ignore')
            })
    
    # Check if the target name exists
    if extracted_info:
        return extracted_info
    else:
        raise ValueError(f"Font style '{target_name}' not found in {font_path}")

def inspect_font_styles(font_path):
    font = TTFont(font_path)
    for record in font['name'].names:
        print(record)

# Function to generate a random string
def generate_random_text(length=12):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# Function to generate a QR code
def generate_qr_code(data, qr_size=(466, 466)):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=1,
    )
    qr.add_data(data)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_img = qr_img.resize(qr_size)
    return qr_img

def create_ticket(base_image_path, output_image_path, i, font_path, target_font_name, text_position=[(546, 1243), (3156, 320)], qr_position=[(537, 800), (3061, 46)]):
    # Load the base image
    base_image = Image.open(base_image_path)

    # Generate random text for QR code data and text beneath it
    qr_text = f"GD15{str(i).zfill(3)}{str(randint(111, 999)).zfill(3)}"
    qr_image = generate_qr_code(qr_text)

    # Extract the specified font style
    try:
        font_details = extract_named_font_style(font_path, target_font_name)
        font = ImageFont.truetype(font_path, 75)  # Load the font using the main font file
    except ValueError as e:
        print(e)
        return

    ## PASTE FIRST
    # Paste the QR code onto the base image
    base_image.paste(qr_image, qr_position[0])

    # Add text beneath the QR code
    draw = ImageDraw.Draw(base_image)
    draw.text(text_position[0], qr_text, font=font, fill="black")

    ## PASTE COPY WITH ROTATION
    # # Rotate the QR code
    # rotated_qr_image = qr_image.rotate(90, expand=True)

    # # Paste the rotated QR code onto the base image
    # base_image.paste(rotated_qr_image, qr_position[1])

    # # Rotate and add text beneath the rotated QR code
    # rotated_text_image = Image.new("RGBA", base_image.size, (255, 255, 255, 0))  # Create a transparent image for text
    # rotated_draw = ImageDraw.Draw(rotated_text_image)
    # rotated_draw.text(text_position[1], qr_text, font=font, fill="black")  # Add text to the temporary image

    # rotated_text_image = rotated_text_image.rotate(90, expand=True)  # Rotate the text image
    # base_image.paste(rotated_text_image, (qr_position[1][0], qr_position[1][1]), rotated_text_image)  # Paste it

    # Save the modified image
    base_image.save(output_image_path)
    return qr_text

def create_vertical_a4_page_with_tickets(ticket_images, output_path, a4_dimensions=(2480, 3508), margin=50):
    """
    Arrange six ticket images on a vertically oriented A4 page, resizing them to fit while preserving aspect ratio.
    Places the tickets in three rows and two columns.

    Args:
        ticket_images (list of str): List of paths to ticket image files.
        output_path (str): Path to save the generated A4 page.
        a4_dimensions (tuple): Dimensions of the vertical A4 page in pixels (default is 2480x3508 for 300 DPI).
        margin (int): Margin between the tickets and page edges, in pixels.
    """
    # A4 page dimensions for vertical orientation
    a4_width, a4_height = a4_dimensions
    rows, cols = 3, 2  # Three rows, two tickets per row
    available_width = a4_width - (cols + 1) * margin  # Subtract margins between columns
    available_height = a4_height - (rows + 1) * margin  # Subtract margins between rows

    # Calculate individual ticket dimensions to fit in grid
    ticket_width = available_width // cols
    ticket_height = available_height // rows

    # Open all ticket images, resize them while preserving aspect ratio
    resized_tickets = []
    for ticket_path in ticket_images:
        ticket = Image.open(ticket_path)
        aspect_ratio = ticket.width / ticket.height
        if aspect_ratio > 1:  # Wider than tall
            new_width = ticket_width
            new_height = int(new_width / aspect_ratio)
        else:  # Taller than wide
            new_height = ticket_height
            new_width = int(new_height * aspect_ratio)
        ticket_resized = ticket.resize((new_width, new_height), Image.Resampling.LANCZOS)
        resized_tickets.append(ticket_resized)

    # Create a blank A4 canvas
    a4_canvas = Image.new("RGB", (a4_width, a4_height), "white")

    # Place tickets in a 3x2 grid
    x_offset, y_offset = margin, margin
    for row in range(rows):
        for col in range(cols):
            index = row * cols + col
            if index >= len(resized_tickets):  # If fewer than 6 tickets, break early
                break
            ticket = resized_tickets[index]

            # Calculate x and y positions to center tickets in their cells
            cell_x = x_offset + col * (ticket_width + margin)
            cell_y = y_offset + row * (ticket_height + margin)

            ticket_x = cell_x + (ticket_width - ticket.width) // 2
            ticket_y = cell_y + (ticket_height - ticket.height) // 2

            # Paste the ticket onto the canvas
            a4_canvas.paste(ticket, (ticket_x, ticket_y))

    # Save the A4 page
    a4_canvas.save(output_path)
    print(f"A4 page created and saved at: {output_path}")


# Main function to run the process
if __name__ == "__main__":
    # inspect_font_styles("./51975.otf")

    font_path = "./51975.otf" 
    target_name = "AcuminVF-BoldItalic"

    try:
        font_style_details = extract_named_font_style(font_path, target_name)
        print("Font Style Details Found:")
        for style in font_style_details:
            print(style)
    except ValueError as e:
        print(e)    

    ticket_numbers = []

    for i in range(50):
        ticket_number = create_ticket(
            base_image_path="./template-final.png",
            output_image_path=f"./output-alt/Generated_Ticket_{i}.png",
            i=i,
            font_path=font_path,
            target_font_name=target_name
        )
        ticket_numbers.append(ticket_number)
        print(f"Ticket generated and saved as 'Generated_Ticket_{i}.png'")

    save_tickets_to_dynamodb(ticket_numbers)

    ticket_images = [f"./output/Generated_Ticket_{i}.png" for i in range(6)]

    # # Create an A4 page with the tickets
    # create_vertical_a4_page_with_tickets(
    #     ticket_images=ticket_images,
    #     output_path="./Tickets_A4_Page.png",
    #     a4_dimensions=(2480, 3508),  # 300 DPI dimensions for A4
    #     margin=50  # Margin between tickets
    # )        