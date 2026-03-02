# SpaceFest 2025 Photo Distribution Web App

**Project Completed: SpaceFest 2025 Photo Distribution Web App 🎉**

This is a Google Apps Script–powered web application designed to make photo distribution seamless for **SpaceFest 2025 – SLIIT NorthernUni | Planet PlayZone**.  
Participants can simply scan a QR code, enter their unique code, and download their event photos instantly—no messy links, no shared folders, and no manual searching.

## 🔗 Live Demo

- Live Web App: https://lnkd.in/edqJUeGh  

> Note: Access and behavior may depend on the event’s sharing configuration and availability.

## ✨ Why I Built This

During large events, sharing photos with participants often becomes a manual, time-consuming process.  
To solve this, I created a **self-service web app** where students can scan a QR code, enter their unique code, and instantly download their event photos.

The system also supports:

- **Expiry dates** for codes  
- **One-time download rules**  
- **Download tracking** for better control and transparency  

## 🛠 Technologies & Tools Used

- **Google Sheets** – Backend database for:
  - Unique codes
  - Google Drive file IDs
  - Download status
  - Expiry dates and metadata
- **Google Drive** – Secure storage and delivery of all event photos.
- **Google Apps Script (JavaScript)** – Connects Sheets, Drive, and the web UI:
  - Validates codes and checks expiry / usage
  - Serves the HTML front-end as a web app
- **HTML + CSS** – Branded, user-friendly interface aligned with **SpaceFest 2025**.
- **QR Code system** – Lets students access the app instantly by scanning a code.

## ⚙️ How It Works

1. **Each student gets a unique code** (auto-generated in Google Sheets).  
2. **Event photos are uploaded** into a Google Drive folder.  
3. **Google Sheets maps** each unique code to a Drive file ID and status.  
4. **Students scan a QR code** to open the web app and enter their code.  
5. **The system validates**:
   - Code exists
   - Not expired
   - Not already used  
6. **If valid**, the student can immediately **download their photo**, and the system can update the status.

## 🤝 Collaboration

This project was successfully completed in collaboration with **@Sanjeev Vijay**, who worked alongside me throughout the development.

## ✅ Benefits

- **Reduces manual effort** for organizers  
- **Improves security** vs. public/shared folders  
- **Gives participants a smooth, modern experience**  
- **Scales easily** for large events with many attendees  

## 🚀 Future Enhancements (Ideas)

- Email notifications with direct download links  
- Admin dashboard to monitor downloads and errors  
- Support for multiple events in one system  
- Easy theming for different event brands  

## 🔖 Topics & Tags

hashtag#GoogleAppsScript  
hashtag#GoogleSheets  
hashtag#GoogleDrive  
hashtag#WebApp  
hashtag#QRcode  
hashtag#Automation  
hashtag#EventTech  
hashtag#SpaceFest2025  
hashtag#SLIITNorthernUni  
hashtag#PlanetPlayZone