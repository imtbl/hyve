import store from '@/store'

const messages = {
  default: 'Could not connect to hyve API. Please check your ' +
    '<code>.env</code> configuration.',
  tokenError: 'Your login has expired. Please log in again.',
  usernameExistsError: 'A user with that name already exists.',
  registrationDisabledError: 'Registration is disabled.',
  userError: 'Username and/or password invalid.',
  missingUsernameFieldError: 'You need to provide a username.',
  invalidUsernameFieldError: 'Invalid username provided, please check your ' +
    'input.',
  missingPasswordFieldError: 'You need to provide a password.',
  invalidPasswordFieldError: 'Invalid password provided, please check your ' +
    'input.',
  missingCurrentPasswordFieldError: 'You need to provide your current ' +
    'password.',
  invalidCurrentPasswordFieldError: 'Invalid current password provided, ' +
    'please check your input.',
  generalFieldsError: 'Invalid fields provided, please check your input.',
  missingPageParameterError: 'No <code>page</code> parameter provided.',
  invalidPageParameterError: 'Invalid <code>page</code> parameter provided.',
  invalidTagsParameterError: 'Invalid <code>tags</code> parameter provided.',
  invalidConstraintsParameterError:
    'Invalid <code>constraints</code> parameter provided.',
  invalidSortParameterError: 'Invalid <code>sort</code> parameter provided.',
  invalidDirectionParameterError: 'Invalid <code>direction</code> parameter ' +
    'provided.',
  missingNamespacesParameterError: 'No <code>namespaces</code> parameter ' +
    'provided.',
  invalidNamespacesParameterError: 'Invalid <code>namespaces</code> ' +
    'parameter provided.',
  invalidContainsParameterError: 'Invalid <code>contains</code> parameter ' +
    'provided.',
  missingIdParameterError: 'No <code>id</code> parameter provided.',
  invalidIdParameterError: 'Invalid <code>id</code> parameter provided.',
  notFoundError: 'The file you are looking for does not exist.',
  syncInProgressError: 'A sync is currently in progress, making the API ' +
    'unavailable. Please try again shortly. If this error persists, please ' +
    'check your server.',
  shuttingDownError: 'hyve is shutting down. This might be due to a ' +
    'reboot. Please check your server.',
  internalServerError: 'hyve has encountered an internal error. Please ' +
    'check your server.'
}

const mappings = {
  MissingTokenError: messages.tokenError,
  InvalidTokenError: messages.tokenError,
  UsernameExistsError: messages.usernameExistsError,
  RegistrationDisabledError: messages.registrationDisabledError,
  InvalidUserError: messages.userError,
  MissingUsernameFieldError: messages.missingUsernameFieldError,
  InvalidUsernameFieldError: messages.invalidUsernameFieldError,
  MissingPasswordFieldError: messages.missingPasswordFieldError,
  InvalidPasswordFieldError: messages.invalidPasswordFieldError,
  MissingCurrentPasswordFieldError: messages.missingCurrentPasswordFieldError,
  InvalidCurrentPasswordFieldError: messages.invalidCurrentPasswordFieldError,
  InvalidLongFieldError: messages.generalFieldsError,
  NoUpdateFieldsError: messages.generalFieldsError,
  MissingPartialTagFieldError: messages.generalFieldsError,
  InvalidPartialTagFieldError: messages.generalFieldsError,
  MissingPageParameterError: messages.missingPageParameterError,
  InvalidPageParameterError: messages.invalidPageParameterError,
  InvalidTagsParameterError: messages.invalidTagsParameterError,
  InvalidConstraintsParameterError: messages.invalidConstraintsParameterError,
  InvalidSortParameterError: messages.invalidSortParameterError,
  InvalidDirectionParameterError: messages.invalidDirectionParameterError,
  MissingNamespacesParameterError: messages.missingNamespacesParameterError,
  InvalidNamespacesParameterError: messages.invalidNamespacesParameterError,
  InvalidContainsParameterError: messages.invalidContainsParameterError,
  MissingIdParameterError: messages.missingIdParameterError,
  InvalidIdParameterError: messages.invalidIdParameterError,
  NotFoundError: messages.notFoundError,
  SyncInProgressError: messages.syncInProgressError,
  ShuttingDownError: messages.shuttingDownError,
  InternalServerError: messages.internalServerError
}

export default {
  async handle (
    serverResponse,
    errorsToHandle = [
      { name: 'SyncInProgressError', isFatal: true, isLocal: false },
      { name: 'ShuttingDownError', isFatal: true, isLocal: false },
      { name: 'InternalServerError', isFatal: true, isLocal: false }
    ]
  ) {
    if (!(serverResponse && serverResponse.data && serverResponse.data.error)) {
      store.dispatch(
        'error/raise',
        {
          name: 'ApiUnavailableError',
          message: messages.default,
          isFatal: true,
          isLocal: false
        }
      )

      return
    }

    const handleableError = errorsToHandle.find(
      error => error.name === serverResponse.data.error
    )

    if (!handleableError) {
      return
    }

    if (
      ['MissingTokenError', 'InvalidTokenError'].includes(handleableError.name)
    ) {
      await store.dispatch('auth/deauthorize', false)
    }

    store.dispatch(
      'error/raise',
      {
        name: handleableError.name,
        message: mappings[handleableError.name],
        isFatal: handleableError.isFatal,
        isLocal: handleableError.isLocal
      }
    )
  }
}
