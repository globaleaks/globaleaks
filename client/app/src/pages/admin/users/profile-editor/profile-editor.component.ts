import {Component, EventEmitter, Input, OnInit, Output, inject} from "@angular/core";
import {NgForm, FormsModule} from "@angular/forms";
import {NgbModal, NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {AppDataService} from "@app/app-data.service";
import {AuthenticationService} from "@app/services/helper/authentication.service";
import {Constants} from "@app/shared/constants/constants";
import {DeleteConfirmationComponent} from "@app/shared/modals/delete-confirmation/delete-confirmation.component";
import {NodeResolver} from "@app/shared/resolvers/node.resolver";
import {PreferenceResolver} from "@app/shared/resolvers/preference.resolver";
import {UtilsService} from "@app/shared/services/utils.service";
import {Observable} from "rxjs";
import {UserProfile} from "@app/models/resolvers/user-resolver-model";
import {nodeResolverModel} from "@app/models/resolvers/node-resolver-model";
import {preferenceResolverModel} from "@app/models/resolvers/preference-resolver-model";
import {NgClass, DatePipe} from "@angular/common";
import {TranslatorPipe} from "@app/shared/pipes/translate";

@Component({
    selector: "src-profile-editor",
    templateUrl: "./profile-editor.component.html",
    standalone: true,
    imports: [FormsModule, NgbTooltipModule, NgClass, DatePipe, TranslatorPipe]
})
export class ProfileEditorComponent implements OnInit {
  private modalService = inject(NgbModal);
  private appDataService = inject(AppDataService);
  private preference = inject(PreferenceResolver);
  private authenticationService = inject(AuthenticationService);
  private nodeResolver = inject(NodeResolver);
  private utilsService = inject(UtilsService);

  @Input() user: UserProfile;
  @Input() users: UserProfile[];
  @Input() index: number;
  @Input() editUser: NgForm;
  @Input() is_profile: boolean;
  @Output() dataToParent = new EventEmitter<string>();
  editing = false;
  defualtUsersArr = ['Admin', 'Analyst', 'Custodian', 'Receiver'];
  nodeData: nodeResolverModel;
  preferenceData: preferenceResolverModel;
  authenticationData: AuthenticationService;
  appServiceData: AppDataService;
  protected readonly Constants = Constants;

  ngOnInit(): void {
    if (this.nodeResolver.dataModel) {
      this.nodeData = this.nodeResolver.dataModel;
    }
    if (this.preference.dataModel) {
      this.preferenceData = this.preference.dataModel;
    }
    if (this.authenticationService) {
      this.authenticationData = this.authenticationService;
    }
    if (this.appDataService) {
      this.appServiceData = this.appDataService;
    }
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  saveUser(userData: UserProfile ) {
    const user = userData;
    return this.utilsService.updateAdminUser(userData.id,userData).subscribe({
      next:()=>{
        this.sendDataToParent();
      },
      error:()=>{
      }
    });
  }

  sendDataToParent() {
    this.dataToParent.emit();
  }

  deleteUser(user:UserProfile) {
    this.openConfirmableModalDialog(user, "").subscribe();
  }

  openConfirmableModalDialog(arg: UserProfile, scope: any): Observable<string> {
    scope = !scope ? this : scope;
    return new Observable((observer) => {
      const modalRef = this.modalService.open(DeleteConfirmationComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.arg = arg;
      modalRef.componentInstance.scope = scope;

      modalRef.componentInstance.confirmFunction = () => {
        observer.complete()
        let url = "api/admin/users/";
        return this.utilsService.deleteAdminUser(arg.id,url,this.is_profile).subscribe(_ => {
          this.utilsService.deleteResource(this.users, arg);
        });
      };
    });
  }

  getUserID() {
    return this.authenticationData.session?.user_id;
  }
}
