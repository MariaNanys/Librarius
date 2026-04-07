import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SearchAdvanceService } from '../services/search-advance.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Interfejs określający strukturę danych wysyłanych do Backendu
export interface SearchBookPayload {
  title?: string;
  author_id?: number[];
  isbn?: number | null;
  published_year_min?: string;
  published_year_max?: string;
  publisher?: string;
  // category_ids?: number[];
  language?: string[];
}

@Component({
  selector: 'app-advanced_search',
  standalone: true,
  imports: [],
  templateUrl: './advanced_search.html',
  styleUrl: './advanced_search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class AdvanceSearchComponent implements OnInit {
  private searchService = inject(SearchAdvanceService);
  private authService = inject(AuthService);
  private searchAdvanceService = inject(SearchAdvanceService);

  private router = inject(Router);

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
  languages = signal<{ code: string; display: string }[]>([]);

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
  selectedLanguageIds = signal<string[]>([]);

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

  filteredLanguages = computed(() => this.languages().filter(l => l.display.toLowerCase().includes(this.searchLanguageTerm().toLowerCase())));
  selectedLanguagesObjects = computed(() => this.languages().filter(l => this.selectedLanguageIds().includes(l.code)));

  // ==========================================
  // 7. POBIERANIE DANYCH Z BE
  // ==========================================
  ngOnInit() {
    this.searchService.getAuthors().subscribe({ next: data => this.authors.set(data), error: err => console.error(err) });
    // this.searchService.getCategories().subscribe({ next: data => this.categories.set(data), error: err => console.error(err) });
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

  // toggleCategoryDropdown() {
  //   this.isCategoryOpen.update(v => !v);
  //   this.isAuthorOpen.set(false);
  //   this.isLanguageOpen.set(false);
  // }

  toggleLanguageDropdown() {
    this.isLanguageOpen.update(v => !v);
    this.isAuthorOpen.set(false);
    this.isCategoryOpen.set(false);
  }

  toggleSelection(code: string | number, signalRef: any) {
    signalRef.update((currentIds: (string | number)[]) => 
      currentIds.includes(code) ? currentIds.filter((i: string | number) => i !== code) : [...currentIds, code]
    );
  }

  removeSelection(code: string | number, event: Event, signalRef: any) {
    event.stopPropagation();
    signalRef.update((currentIds: string[] | number[]) => currentIds.filter((i: string | number) => i !== code));
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
      author_id: this.selectedAuthorIds(),
      isbn: this.resourceNumber(),
      published_year_min: this.dateFrom(),
      published_year_max: this.dateTo(),
      publisher: this.publisher(),
      // category_ids: this.selectedCategoryIds(),
      language: this.selectedLanguageIds()
    };

    // Usuwamy puste pola, żeby ładniej wyglądało w żądaniu do BE
    if (!payload.title) delete payload.title;
    if (!payload.isbn) delete payload.isbn;
    if (!payload.published_year_min) delete payload.published_year_min;
    if (!payload.published_year_max) delete payload.published_year_max;
    if (!payload.publisher) delete payload.publisher;
    if (payload.author_id && payload.author_id.length === 0) delete payload.author_id;
    // if (payload.category_ids && payload.category_ids.length === 0) delete payload.category_ids;
    if (payload.language && payload.language.length === 0) delete payload.language;
 this.router.navigate(['/search'], { queryParams: { ...payload, advanced: 'true' } });
    console.log('Gotowe do wysłania na BE:', payload);
     this.searchAdvanceService.searchAdvanced(payload).subscribe((result) => {
      console.log(result);
     })
  }
}