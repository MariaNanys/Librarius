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

  formatDate(dt: string | null): string {
    if (!dt) return '-';
    const d = new Date(dt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  }

  authorsLabel(r: Reservation): string {
    return r.book.authors?.map((a) => a.name).join(', ') || '-';
  }

  readerName(r: Reservation): string {
    if (!r.reader) return '-';
    return `${r.reader.first_name} ${r.reader.last_name}`.trim() || '-';
  }
}
