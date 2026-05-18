import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reservation, ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-librarian-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class LibrarianDashboardComponent implements OnInit {
  private reservationService = inject(ReservationService);

  reservations = signal<Reservation[]>([]);
  isLoading = signal<boolean>(true);
  loadError = signal<string>('');
  expandedId = signal<number | null>(null);

  acceptPopupOpen = signal<boolean>(false);
  reservationToAccept = signal<Reservation | null>(null);
  isAccepting = signal<boolean>(false);
  acceptError = signal<string>('');

  rejectPopupOpen = signal<boolean>(false);
  reservationToReject = signal<Reservation | null>(null);
  isRejecting = signal<boolean>(false);
  rejectError = signal<string>('');

  successPopupOpen = signal<boolean>(false);
  successMessage = signal<string>('');
  private successTimeoutHandle: number | null = null;

  private readonly endedStatuses = ['closed', 'rejected', 'cancelled', 'expired'];

  pendingCount = computed(
    () => this.reservations().filter((r) => r.status.name === 'pending').length
  );
  acceptedCount = computed(
    () => this.reservations().filter((r) => r.status.name === 'accepted').length
  );
  endedCount = computed(
    () => this.reservations().filter((r) => this.endedStatuses.includes(r.status.name)).length
  );

  pendingReservations = computed<Reservation[]>(() =>
    this.reservations()
      .filter((r) => r.status.name === 'pending')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  );

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.list().subscribe({
      next: (data) => {
        this.reservations.set(data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania rezerwacji:', err);
        this.loadError.set('Nie udało się pobrać danych.');
        this.isLoading.set(false);
      },
    });
  }

  toggleExpand(id: number): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  isPending(status: string): boolean {
    return status === 'pending';
  }

  openAcceptPopup(reservation: Reservation): void {
    this.reservationToAccept.set(reservation);
    this.acceptError.set('');
    this.acceptPopupOpen.set(true);
  }

  closeAcceptPopup(): void {
    this.acceptPopupOpen.set(false);
    this.reservationToAccept.set(null);
    this.isAccepting.set(false);
    this.acceptError.set('');
  }

  confirmAccept(): void {
    const reservation = this.reservationToAccept();
    if (!reservation) return;

    this.isAccepting.set(true);
    this.acceptError.set('');
    this.reservationService.accept(reservation.id).subscribe({
      next: () => {
        this.closeAcceptPopup();
        this.successMessage.set('Rezerwacja potwierdzona pomyślnie.');
        this.successPopupOpen.set(true);
        this.scheduleSuccessClose();
        this.loadReservations();
      },
      error: (err) => {
        console.error('Błąd potwierdzania:', err);
        this.acceptError.set('Nie udało się potwierdzić rezerwacji.');
        this.isAccepting.set(false);
      },
    });
  }

  openRejectPopup(reservation: Reservation): void {
    this.reservationToReject.set(reservation);
    this.rejectError.set('');
    this.rejectPopupOpen.set(true);
  }

  closeRejectPopup(): void {
    this.rejectPopupOpen.set(false);
    this.reservationToReject.set(null);
    this.isRejecting.set(false);
    this.rejectError.set('');
  }

  confirmReject(): void {
    const reservation = this.reservationToReject();
    if (!reservation) return;

    this.isRejecting.set(true);
    this.rejectError.set('');
    this.reservationService.reject(reservation.id).subscribe({
      next: () => {
        this.closeRejectPopup();
        this.successMessage.set('Rezerwacja anulowana pomyślnie.');
        this.successPopupOpen.set(true);
        this.scheduleSuccessClose();
        this.loadReservations();
      },
      error: (err) => {
        console.error('Błąd anulowania:', err);
        this.rejectError.set('Nie udało się anulować rezerwacji.');
        this.isRejecting.set(false);
      },
    });
  }

  private scheduleSuccessClose(): void {
    if (this.successTimeoutHandle !== null) {
      clearTimeout(this.successTimeoutHandle);
    }
    this.successTimeoutHandle = window.setTimeout(() => {
      this.successPopupOpen.set(false);
      this.successTimeoutHandle = null;
    }, 2000);
  }

  formatDate(dt: string | null): string {
    if (!dt) return '-';
    const d = new Date(dt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  }

  endTimeDisplay(r: Reservation): string {
    if (r.status.name === 'pending') return '-';
    return this.formatDate(r.planned_end_time ?? r.end_time ?? r.updated_at);
  }

  pickupDeadline(): string {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 72);
    return this.formatDate(deadline.toISOString());
  }

  authorsLabel(r: Reservation): string {
    return r.book.authors?.map((a) => a.name).join(', ') || '-';
  }

  readerName(r: Reservation): string {
    if (!r.reader) return '-';
    return `${r.reader.first_name} ${r.reader.last_name}`.trim() || '-';
  }
}
