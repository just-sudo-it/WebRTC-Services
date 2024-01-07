import { TestBed } from '@angular/core/testing';

import { FilesharingService } from './filesharing.service';

describe('FilesharingService', () => {
  let service: FilesharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilesharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
