import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { VideoCallComponent } from './video-call/video-call.component';

export const routes: Routes = [
  { path: '', component: VideoCallComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    VideoCallComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    FormsModule,
    CommonModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
