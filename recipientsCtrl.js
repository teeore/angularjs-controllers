'use strict';

/**
 * @ngdoc function
 * @name studiocdnWebApp.controller:RecipientsCtrl
 * @description
 * # RecipientsCtrl
 * Controller of the recipientsApp
 */

angular.module('recipientsApp')
    .controller('RecipientsCtrl', ['$scope', '$rootScope', '$timeout', 'recipientsSvc', 'cacheWrapperSvc', 'userSvc', '$q', 'mailboxSvc', function(
        $scope,
        $rootScope,
        $timeout,
        recipientsSvc,
        cacheWrapperSvc,
        userSvc,
        $q,
        mailboxSvc) {

        $scope.recipient = {};
        $scope.recipientList = [];

        // check if recipient is included on page refresh
        $timeout(function() {
            $rootScope.$emit('rootScope:recipientChange', $scope.recipientList.length);
        }, 1000);

        $scope.addRecpEmail = function() {
            if (getAddressList($scope.recipientList).indexOf(mailboxSvc.getAddress($scope.recipient.email.toLowerCase())) < 0) {
                $scope.recipientList.push(
                    $scope.recipient.email
                );
                recipientsSvc.addRecipient($scope.recipient.email);
                $rootScope.$emit('rootScope:recipientChange', $scope.recipientList.length);
            }
            $scope.recipient.email = '';
            $scope.hideIcon = false;

        };
        $scope.removeRecp = function(index) {
            recipientsSvc.fetchRecipients().then(function(result) {
                recipientsSvc.setRecipients(result.data);
                recipientsSvc.removeRecipient($scope.recipientList[index]);
                $scope.recipientList = recipientsSvc.getRecipients();
                $rootScope.$emit('rootScope:recipientChange', $scope.recipientList.length);
            });

        };

        $scope.removeAllRecp = function() {
            recipientsSvc.fetchRecipients().then(function(result) {
                recipientsSvc.setRecipients(result.data);
                recipientsSvc.removeAllRecipients();
                $scope.recipientList = [];
                $rootScope.$emit('rootScope:recipientChange', $scope.recipientList.length);
            });

        };

    }]);
