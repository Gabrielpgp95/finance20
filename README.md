# Client Appointment Planner

A simple and elegant web-based appointment booking system to manage your clients and their appointments.

## Features

✨ **Client Management**
- Add, edit, and delete clients
- Store client contact information (name, email, phone)
- Add notes for each client
- Search functionality to find clients quickly

📅 **Appointment Scheduling**
- Schedule appointments with specific dates and times
- Set appointment duration (30, 60, 90, or 120 minutes)
- Add service type and notes
- Filter appointments (All, Upcoming, Today, Past)
- Edit or delete appointments

🗓️ **Calendar View**
- Visual calendar showing all appointments
- Monthly view with navigation
- Click on appointments to edit
- Today's date highlighted
- Shows up to 3 appointments per day (with more indicator)

💾 **Data Persistence**
- All data saved in browser's local storage
- No server required - works completely offline

## How to Use

1. **Open the application**: Simply open `index.html` in any modern web browser

2. **Add Clients**:
   - Click "Clients" tab
   - Click "+ Add Client" button
   - Fill in client details (name and phone are required)
   - Click "Save Client"

3. **Schedule Appointments**:
   - Click "Appointments" tab
   - Click "+ Schedule Appointment" button
   - Select a client from the dropdown
   - Choose date, time, and duration
   - Optionally add service type and notes
   - Click "Save Appointment"

4. **View Calendar**:
   - Click "Calendar" tab
   - Navigate between months using arrow buttons
   - Click on any appointment to edit it

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## Data Storage

All data is stored locally in your browser using LocalStorage. This means:
- ✅ No internet connection required
- ✅ Your data stays private on your device
- ⚠️ Data is specific to the browser you're using
- ⚠️ Clearing browser data will delete all appointments and clients

## Tips

- Add clients before scheduling appointments
- Use the search feature to quickly find clients
- Filter appointments to see upcoming, today's, or past appointments
- Click on calendar appointments to quickly edit them
- The calendar highlights today's date

## Future Enhancements

Potential features to add:
- Export appointments to CSV
- Email/SMS reminders
- Recurring appointments
- Color-coded appointment types
- Print calendar view
- Data backup and restore

---

Enjoy managing your client appointments! 📅✨
