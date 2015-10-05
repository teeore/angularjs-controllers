'use strict';

angular.module('ckEditor', ['uploadService', 'fileControls'])
    .directive('ckEdit', ['$compile', 'fileService', 'urlStore', '$rootScope', function ($compile, fileSvc, urlStore, $rootScope) {
        return {
            restrict: 'A',
            controller: '@',
            name: 'ctrl',
            require: 'ngModel',
            scope: {
                ngModel: '@',
                config: '@'
            },
            link: function (scope, element) {
                var configFile = scope.config || 'ckeditor_send_body.js';
                var editor = CKEDITOR.replace(element[0], {
                    customConfig: '/modules/commons/ckeditor/ck_custom_config/' + configFile
                });

                editor.on('blur', function () {
                    scope.editorData = editor.document.$.body.innerHTML;
                    scope.$broadcast('editorChanged');
                });

                editor.on('pasteState', function () {
                    scope.editorData = editor.document.$.body.innerHTML;
                    if (scope.editorData.indexOf('href="{$link}"') > -1) {
                        scope.$emit('editorPaste', true);
                    } else {
                        scope.$emit('editorPaste', false);
                    }
                });

                scope.setEditorData = function (data, ngModel) {
                    if (ngModel) {
                        if (scope.ngModel === ngModel) {
                            editor.document.$.body.innerHTML = data;
                        }
                    } else {
                        editor.document.$.body.innerHTML = data;
                    }
                    editor.focus();
                };

                scope.getEditorData = function (ngModel) {
                    if (ngModel) {
                        if (scope.ngModel === ngModel) {
                            return editor.document.$.body.innerHTML;
                        }
                    } else {
                        return editor.document.$.body.innerHTML;
                    }
                };

                var assetUploadUrl = urlStore.getAssetUploadUrl();
                $rootScope.$on('rootScope:updateUI', function () {
                    assetUploadUrl = urlStore.getAssetUploadUrl();
                });

                scope.setCkEditorAssetUploadUrl = function (ngModel, url) {
                    if (scope.ngModel === ngModel) {
                        assetUploadUrl = url;
                    }
                };

                CKEDITOR.on('instanceReady', function () {
                    var iframe = editor.element.$.parentNode.querySelector('iframe');
                    var windowHeight = angular.element(window).height();
                    var sendEditor = angular.element('#cke_emailEditor > .cke_inner > div');
                    sendEditor.height((windowHeight - 278) + 'px');

                    angular.element(window).bind('resize', function () {
                        sendEditor.height((windowHeight - 278) + 'px');
                    });

                    if (!(editor.document)) {
                        return;
                    }
                    var contents = editor.document.$.body;
                    var contentHtml = editor.document.$.documentElement;
                    var iframeWidth = contents.clientWidth;
                    var iframeHeight = iframe.clientHeight;

                    contents.setAttribute('ng-file-drop', '');

                    contents.setAttribute('ng-model', scope.ngModel);
                    contentHtml.setAttribute('style', 'min-height: 100%; height:100%');
                    contents.setAttribute('style', 'height: 100%; margin:0; width:100%');
                    contents.setAttribute('accept', 'image/*');

                    function handleDragEnter(evt) {
                        if (evt.dataTransfer.items[0].type.indexOf('image') > -1) {
                            contents.setAttribute('style', 'height: 100%; width:100%; margin:0;border: 1px dashed #000;background:#ddd');
                        } else {
                            contents.setAttribute('style', 'height: 100%; width:100%; margin:0;border: 1px dashed red');
                        }
                    }

                    function handleDragLeave() {
                        contents.removeAttribute('style');
                        contents.setAttribute('style', 'height: 100%; margin:0; width:100%');
                    }

                    contents.addEventListener('dragenter', handleDragEnter, false);
                    contents.addEventListener('dragleave', handleDragLeave, false);
                    contents.addEventListener('drop', handleDragLeave, false);

                    $compile(contents)(scope);

                    scope.$broadcast('editorLoaded');
                });

                function upload(files) {
                    if (files && files.length) {
                        fileSvc.hashFiles(files, null, function (hashedFile) {
                            CKEDITOR.instances[editor.name].insertHtml('<img id=\'' + hashedFile.hash + '\' src=\'images/loader.gif\'/>');
                            fileSvc.uploadFileToS3(assetUploadUrl, hashedFile, 'related',
                                function (fileBeingUploaded, progress) {
                                    scope.$broadcast(scope.coverArtUploadProgressMsg, {
                                        hashKey: fileBeingUploaded.hash,
                                        progress: progress
                                    });
                                },
                                function (uploadedFile, uploadedFileUrl) {
                                    scope.$broadcast(scope.coverArtAvailableMsg, {
                                        hashKey: uploadedFile.hash
                                    });
                                    var loader = CKEDITOR.instances[editor.name].document.$.querySelector('#' + uploadedFile.hash);
                                    if (loader) {
                                        loader.remove();
                                    }
                                    CKEDITOR.instances[editor.name].insertHtml('<img style="max-width:100%" src=\'' + uploadedFileUrl + '\'/>');
                                },
                                function (fileBeingUploaded, abortFunction) {
                                    scope.$broadcast(scope.coverArtUploadStartedMsg, {
                                        hashKey: fileBeingUploaded.hash,
                                        abortFunction: abortFunction
                                    });
                                });
                        });
                    }
                }

                var timeDiff;
                scope.$watch(scope.ngModel, function (files) {
                    if (files && files.length) {
                        if (scope.lastUpload) {
                            timeDiff = Date.now() - scope.lastUpload;
                            if (timeDiff > 500) {
                                scope.lastUpload = Date.now();
                                upload(files);
                            }
                        } else {
                            scope.lastUpload = Date.now();
                            upload(files);
                        }
                    }
                });
            }
        };
    }]);
