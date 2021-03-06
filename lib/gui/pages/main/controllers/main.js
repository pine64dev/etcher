/*
 * Copyright 2016 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const units = require('../../../../shared/units');

module.exports = function(
  SelectionStateModel,
  DrivesModel,
  FlashStateModel,
  SettingsModel,
  TooltipModalService,
  ErrorService,
  OSOpenExternalService,
  WarningModalService
) {

  // Expose several modules to the template for convenience
  this.selection = SelectionStateModel;
  this.drives = DrivesModel;
  this.state = FlashStateModel;
  this.settings = SettingsModel;
  this.external = OSOpenExternalService;

  /**
   * @summary Determine if the drive step should be disabled
   * @function
   * @public
   *
   * @returns {Boolean} whether the drive step should be disabled
   *
   * @example
   * if (MainController.shouldDriveStepBeDisabled()) {
   *   console.log('The drive step should be disabled');
   * }
   */
  this.shouldDriveStepBeDisabled = () => {
    return !SelectionStateModel.hasImage() && !SelectionStateModel.hasOS();
  };

  /**
   * @summary Determine if the flash step should be disabled
   * @function
   * @public
   *
   * @returns {Boolean} whether the flash step should be disabled
   *
   * @example
   * if (MainController.shouldFlashStepBeDisabled()) {
   *   console.log('The flash step should be disabled');
   * }
   */
  this.shouldFlashStepBeDisabled = () => {
    if (SelectionStateModel.hasOS()) {
      return !SelectionStateModel.hasImage();
    }
    return !SelectionStateModel.hasDrive() || this.shouldDriveStepBeDisabled();
  };

  /**
   * @summary Display a tooltip with the selected image details
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * MainController.showSelectedImageDetails()
   */
  this.showSelectedImageDetails = () => {
    if (SelectionStateModel.getImagePath()) {
      if (this.selection.hasOS()) {
        return TooltipModalService.show({
          title: 'OS Image Download Path',
          message: SelectionStateModel.getImagePath()
        }).catch(ErrorService.reportException);
      }

      return TooltipModalService.show({
        title: 'Image File Path',
        message: SelectionStateModel.getImagePath()
      }).catch(ErrorService.reportException);
    }

    let message = 'Please connect a drive';
    if (this.drives.getDrives().length > 0) {
      message = 'Please insert a drive that has more than ' + units.bytesToGigabytes(this.selection.getOSMinimumSize()) + 'GB';
    }
    return WarningModalService.display({
      confirmationLabel: 'OK',
      description: message
    });
  };

  /**
   * @summary Handling label for drive button.
   * @function
   * @public
   *
   * @returns {String} button's label
   */
  this.showDriveButtonLabel = () => {
    if (this.drives.hasAvailableDrives()) {
      return 'Select drive';
    }
    return 'Connect a drive';
  };
};
