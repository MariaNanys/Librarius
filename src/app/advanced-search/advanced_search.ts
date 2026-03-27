import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SearchAdvanceService } from '../services/search-advance.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Interfejs określający strukturę danych wysyłanych do Backendu
export interface SearchBookPayload {
  title?: string;
  author_ids?: number[];
  resource_number?: number | null;
  date_from?: string;
  date_to?: string;
  publisher?: string;
  category_ids?: number[];
  language_ids?: number[];
}

@Component({
  selector: 'app-advanced_search',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './advanced_search.html',
  styleUrl: './advanced_search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class AdvanceSearchComponent implements OnInit {
  private searchService = inject(SearchAdvanceService);
  private authService = inject(AuthService);

  isLoggedIn = computed(() => this.authService.currentUser() !== null);

  // ==========================================
  // 1. ZWYKŁE POLA TEKSTOWE
  // ==========================================
  searchTitle = signal<string>('');
  resourceNumber = signal<number | null>(null);
  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  publisher = signal<string>('');

  // ==========================================
  // 2. LISTY POBRANE Z BACKENDU
  // ==========================================
  authors = signal<{ id: number; name: string }[]>([]);
  categories = signal<{ id: number; name: string }[]>([]);
  languages = signal<{ id: number; name: string }[]>([]);

  // ==========================================
  // 3. STANY OTWARCIA MULTISELECTÓW
  // ==========================================
  isAuthorOpen = signal(false);
  isCategoryOpen = signal(false);
  isLanguageOpen = signal(false);

  // ==========================================
  // 4. ZAZNACZONE ELEMENTY (ID)
  // ==========================================
  selectedAuthorIds = signal<number[]>([]);
  selectedCategoryIds = signal<number[]>([]);
  selectedLanguageIds = signal<number[]>([]);

  // ==========================================
  // 5. WYSZUKIWARKI W MULTISELECTACH
  // ==========================================
  searchAuthorTerm = signal('');
  searchCategoryTerm = signal('');
  searchLanguageTerm = signal('');

  // ==========================================
  // 6. COMPUTED: PRZEFILTROWANE LISTY (DO WYŚWIETLANIA)
  // ==========================================
  filteredAuthors = computed(() => this.authors().filter(a => a.name.toLowerCase().includes(this.searchAuthorTerm().toLowerCase())));
  selectedAuthorsObjects = computed(() => this.authors().filter(a => this.selectedAuthorIds().includes(a.id)));

  filteredCategories = computed(() => this.categories().filter(c => c.name.toLowerCase().includes(this.searchCategoryTerm().toLowerCase())));
  selectedCategoriesObjects = computed(() => this.categories().filter(c => this.selectedCategoryIds().includes(c.id)));

  filteredLanguages = computed(() => this.languages().filter(l => l.name.toLowerCase().includes(this.searchLanguageTerm().toLowerCase())));
  selectedLanguagesObjects = computed(() => this.languages().filter(l => this.selectedLanguageIds().includes(l.id)));

  // ==========================================
  // 7. POBIERANIE DANYCH Z BE
  // ==========================================
  ngOnInit() {
    this.searchService.getAuthors().subscribe({ next: data => this.authors.set(data), error: err => console.error(err) });
    this.searchService.getCategories().subscribe({ next: data => this.categories.set(data), error: err => console.error(err) });
    this.searchService.getLanguages().subscribe({ next: data => this.languages.set(data), error: err => console.error(err) });
  }

  // ==========================================
  // 8. METODY STERUJĄCE INTERFEJSEM
  // ==========================================
  toggleAuthorDropdown() {
    this.isAuthorOpen.update(v => !v);
    this.isCategoryOpen.set(false);
    this.isLanguageOpen.set(false);
  }

  toggleCategoryDropdown() {
    this.isCategoryOpen.update(v => !v);
    this.isAuthorOpen.set(false);
    this.isLanguageOpen.set(false);
  }

  toggleLanguageDropdown() {
    this.isLanguageOpen.update(v => !v);
    this.isAuthorOpen.set(false);
    this.isCategoryOpen.set(false);
  }

  toggleSelection(id: number, signalRef: any) {
    signalRef.update((currentIds: number[]) => 
      currentIds.includes(id) ? currentIds.filter((i: number) => i !== id) : [...currentIds, id]
    );
  }

  removeSelection(id: number, event: Event, signalRef: any) {
    event.stopPropagation();
    signalRef.update((currentIds: number[]) => currentIds.filter((i: number) => i !== id));
  }

  updateSearchTerm(event: Event, signalRef: any) {
    signalRef.set((event.target as HTMLInputElement).value);
  }

  // ==========================================
  // 9. GŁÓWNA METODA WYSYŁAJĄCA
  // ==========================================
  onSubmit() {
    const payload: SearchBookPayload = {
      title: this.searchTitle(),
      author_ids: this.selectedAuthorIds(),
      resource_number: this.resourceNumber(),
      date_from: this.dateFrom(),
      date_to: this.dateTo(),
      publisher: this.publisher(),
      category_ids: this.selectedCategoryIds(),
      language_ids: this.selectedLanguageIds()
    };

    // Usuwamy puste pola, żeby ładniej wyglądało w żądaniu do BE
    if (!payload.title) delete payload.title;
    if (!payload.resource_number) delete payload.resource_number;
    if (!payload.date_from) delete payload.date_from;
    if (!payload.date_to) delete payload.date_to;
    if (!payload.publisher) delete payload.publisher;
    if (payload.author_ids && payload.author_ids.length === 0) delete payload.author_ids;
    if (payload.category_ids && payload.category_ids.length === 0) delete payload.category_ids;
    if (payload.language_ids && payload.language_ids.length === 0) delete payload.language_ids;

    console.log('Gotowe do wysłania na BE:', payload);
    
  }
}