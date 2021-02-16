import { TestBed } from '@angular/core/testing';

import { FontServiceService } from './font-service.service';

describe('FontServiceService', () => {
  let service: FontServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FontServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
