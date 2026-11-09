
import { supabase } from './supabase.js';
const doctors = [
  'Dr. Ros Pernitez – Dentist',
  'Dr. Maria Santos – Dentist',
];

const appointmentTimes = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

let selectedDoctor = doctors[0];
let selectedDate = '';
let selectedTime = '08:00 AM';
let slipNumber = '';
let currentStep = 1;

let submissionLocked = false;

const app = document.querySelector('#app');

const toothIcon = `
  <svg aria-hidden="true" class="tooth-icon" viewBox="0 0 32 32" fill="none">
    <path
      d="M8.2 5.9c2.2-1.3 4.3-.2 5.4.3.9.4 1.7.4 2.5 0 1.1-.5 3.2-1.6 5.5-.3 2.9 1.7 3 5.5 2.1 8.3-.7 2.2-2.1 3.8-2.7 6-.8 2.8-.7 6-2.8 6.2-2.6.3-2-6.7-4.3-6.7s-1.7 7-4.3 6.7c-2.1-.2-2-3.4-2.8-6.2-.6-2.2-2-3.8-2.7-6-.9-2.8-.8-6.6 2.1-8.3Z"
      fill="currentColor"
    />
  </svg>
`;

const successIcon = `
  <svg aria-hidden="true" class="success-icon" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="4"/>
    <path
      d="m20 32 8 8 18-20"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

function renderHeader() {
  return `
    <header class="site-header">
      <div class="header-content">
        <div class="brand-mark">${toothIcon}</div>
        <span>Dental Clinic Appointment System</span>
      </div>
    </header>
  `;
}

function renderApp() {
  app.innerHTML = `
    <div class="app-shell">
      ${renderHeader()}

      <main class="page-content">
        <section class="intro">
          <h1>Appointments</h1>
          <p>Manage your clinic appointments below</p>
        </section>

        <div id="step-content"></div>
      </main>

      <div id="modal-container"></div>
    </div>
  `;

  renderAppointmentStep();
}


function renderAppointmentStep() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    <section class="appointment-card">
      <h2>Appointment Details</h2>

      <form id="appointment-form" novalidate>

        <label for="doctor">Select Doctor</label>

        <div class="select-wrap">
          <select id="doctor">
            ${doctors.map(name => `
              <option value="${name}" ${name === selectedDoctor ? 'selected' : ''}>
                ${name}
              </option>
            `).join('')}
          </select>
        </div>

        <label for="date">Appointment Date</label>

        <input
          id="date"
          type="date"
          lang="en-GB"
          value="${selectedDate}"
          required
        />

        <label for="time">Appointment Time</label>

        <div class="select-wrap">
          <select id="time" required>
            <option value="">Select a time</option>
            ${appointmentTimes.map(time => `
              <option value="${time}" ${time === selectedTime ? 'selected' : ''}>
                ${time}
              </option>
            `).join('')}
          </select>
        </div>

        <p class="validation-message" id="appointment-error" role="alert" hidden></p>

        <div class="form-navigation">
          <button type="submit" class="confirm-button">
            CONFIRM
          </button>
        </div>

      </form>
    </section>
  `;

  document.querySelector('#doctor').addEventListener('change', event => {
    selectedDoctor = event.target.value;
  });

  document.querySelector('#date').addEventListener('change', event => {
    selectedDate = event.target.value;
  });

  document.querySelector('#time').addEventListener('change', event => {
    selectedTime = event.target.value;
  });

  document.querySelector('#appointment-form').addEventListener('submit', handleSubmit);
}


async function handleSubmit(event) {
  event.preventDefault();

  if (submissionLocked) return;

  selectedDoctor = document.querySelector('#doctor').value;
  selectedDate = document.querySelector('#date').value;
  selectedTime = document.querySelector('#time').value;

  const errorMessage = document.querySelector('#appointment-error');

  if (!selectedDoctor || !selectedDate || !selectedTime) {
    errorMessage.textContent =
      'Please complete all appointment fields before continuing.';
    errorMessage.hidden = false;
    return;
  }

  submissionLocked = true;
  errorMessage.hidden = true;

  try {
    const { data, error } = await supabase.rpc(
      'create_appointment',
      {
        p_dentist_name: selectedDoctor,
        p_appointment_date: selectedDate,
        p_appointment_time: convertTo24Hour(selectedTime)
      }
    );

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'This dentist is already booked for the selected date and time. Please choose another time.'
        );
      }

      throw new Error(error.message);
    }

    showConfirmation(data);

  } catch (error) {
    console.error('Appointment Error:', error);

    errorMessage.textContent = error.message;
    errorMessage.hidden = false;

    submissionLocked = false;
  }
}

function convertTo24Hour(time) {
  const [clock, period] = time.split(' ');
  let [hours, minutes] = clock.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}


function handleEscape(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

function showConfirmation(slipNumber) {
  const modalContainer = document.querySelector('#modal-container');

  modalContainer.innerHTML = `
    <div class="modal-overlay" role="presentation">
      <section
        aria-labelledby="success-title"
        aria-describedby="success-message"
        aria-modal="true"
        class="confirmation-modal"
        role="dialog"
      >
        ${successIcon}

        <h2 id="success-title">Appointment Successfully Created!</h2>

        <div class="slip-box">
          <span>Appointment Slip Number</span>
          <strong>${slipNumber}</strong>
        </div>

        <p id="success-message" class="modal-message">
          Please present this slip number to the front desk upon arrival at the
          clinic. A staff member will verify your appointment using this reference
          number.
        </p>

        <button class="ok-button" id="ok-button" type="button">
          OK
        </button>
      </section>
    </div>
  `;

  document.querySelector('#ok-button').focus();

  document.querySelector('#ok-button').addEventListener('click', () => {
  closeModal();
  });

  document.addEventListener('keydown', handleEscape);
}

function closeModal() {
  document.removeEventListener('keydown', handleEscape);

  selectedDoctor = doctors[0];
  selectedDate = '';
  selectedTime = '08:00 AM';
  slipNumber = '';
  submissionLocked = false;
  currentStep = 1;

  const modalContainer = document.querySelector('#modal-container');
  modalContainer.innerHTML = '';

  renderAppointmentStep();
}

renderApp();
async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('Appointments')
    .select('appointment_id')
    .limit(1);

  if (error) {
    console.error('Supabase connection error:', error.message);
    return;
  }

  console.log('Supabase connected successfully!', data);
}

testSupabaseConnection();