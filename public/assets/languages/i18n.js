Em.I18n.translations = {

  // These are common text used throughout the app
  'common' : {
    'submit': 'Submit',
    'save': 'Save',
    'cancel': 'Cancel',
    'yes': 'Yes',
    'no': 'No',
    'error': 'Error',
    'warning': 'Warning'
  },

  // Administration pages..
  'administration': {
    'administrators': { // title above the main menu
      'title': 'Administrators'
    },
    'company': {
      'add': {  // company "buttons"
        'button': 'Add Company',
        'domain': 'Add Domain',
        'location': 'Add Location',
        'team': 'Add Team'
      },
      'delete' : {
        'location': { // dialog to delete company location
          'id': 'admin 01',
          'title': 'Delete company location: ',
          'areyousure': 'Are you sure you want to attempt to delete '
        }
      },
      'edit': {
        'shortname' : { // dialog to edit company short name
          'id': 'admin 02',
          'title': 'Edit short name'
        },
        'team' : { // dialog to edit company team name
          'id': 'admin 03',
          'title': 'Edit team name'
        }
      },
      'fullMenu': 'Companies',
      'menu': 'Companies',
      'new': { // new company name field
        label: 'New Company Name',
        prompt: 'Enter new company name here'
      },
      'shortname': { // new company short name field
        label: "Company's Short/Nick Name",
        prompt: 'Enter company short name here'
      },
      'header': { // Company table column headers
        'name': 'Name',
        'shortName': 'Short Name',
        'members': 'Members',
        'domains': 'Domains',
        'locations': 'Locations',
        'teams': 'Teams'
      },
    },
    'dashboard' : { // Link back to main menu page
      'title': 'Administration Dashboard'
    },
    // Following are the menu selections on the main page
    'member' : {
      'fullMenu': 'Members',
      'menu': 'Members'
    },
    'message' : {
      'fullMenu': 'Messages',
      'menu': 'Messages'
    },
    'recommendation' : {
      'match': {
        title: 'Setup Match?',
        message: 'Are you sure you want to setup a Match for '
      }
    },
    'recommender' : {
      'fullMenu': 'Recommender Configuration',
      'menu': 'Recommender'
    },
    'trip' : {
      'fullMenu': 'Trips',
      'menu': 'Trips'
    },
    'fan' : {
      'fullMenu': 'Fan Company Requests',
      'menu': 'Fan'
    },
    'trackingCount' : {
      'fullMenu': 'Tracking Count Report',
      'menu': 'Tracking'
    },
    'dau' : {
      'fullMenu': 'Daily Active Users',
      'menu': 'Daily'
    },
    'match' : {
      'fullMenu': 'Match Two Report',
      'menu': 'Match'
    },
    'unconfirmed' : {
      'fullMenu': 'Unconfirmed Registrants',
      'menu': 'Unconfirmed',
      'resendEmail': {
        title: 'Confirm Resend Email',
        message: 'Are you sure you want to resend the email to:<br><br>'
      }
    }
  },

  // The following are all the error messages...
  'error': {
    // Admin pages
    'administration': {
      'company': {
        'submit': { // new company
          'id': 'admin e1',
          'title': 'Error',
          'message': 'Error creating company: '
        },
        'edit': { // edit company short name
          'shortname': {
            'submit': {
              'id': 'admin e2',
              'title': 'Error',
              'message': 'Error saving short name: '
            }
          }
        },
        'location': { // deleting company location
          'delete': {
            'id': 'admin e3',
            'title': 'Error',
            'message': 'Error while updating configuration.'
          }
        }
      },
      'recommender': {
        'submit': { // updating recommender conf
          'id': 'admin e4',
          'title': 'Error',
          'message': 'Error while updating configuration.'
        }
      },
      'trip': {
        'lookup': { // lookup of trips using date range
          'id': 'admin e5',
          'title': 'Error',
          'message': 'Find failed. '
        }
      },
      'trackingCount' : {
        'lookup': { // lookup of trips using date range
          'id': 'admin e6',
          'title': 'Error',
          'message': 'Find failed. '
        }
      },
      'unconfirmed': {
        'resendEmail': { // resend the confirm email
          'id': 'admin e7',
          'title': 'Error resend email to ',
          'message': 'Resend failed. '
        }
      }

    },

    // Account Management right now only password change off the profile page
    'account': {
      'management': {
        'old': {
          'password': { // Old email doesn't match what is stored
            'invalid': {
              'id': 'account e1',
              'title': 'Account Management',
              'message': 'The old password you entered is invalid.'
            },
            'matching': { // Only allow new passwords... Really not needed but just a warning
              'id': 'account e2',
              'title': 'Account Management',
              'message': 'Current password and new password cannot match. Please change passwords and try again.'
            }
          }
        },
        'password': {
          'submit': { // Got an error while saving password
            'id': 'account e3',
            'title': 'Account Management',
            'message': 'An error occurred while re-authorizing you. Please contact the system administrator.'
          }
        },
      }
    },

    // Profile/OnBoarding
    'profile': {
      'member': {
        'submit': { // All member model information is save via the same routine... Your Work, About You, Driving, Where From, Where To
          'id': 'profile e1',
          'title': 'Warning...',
          'message': 'Error while saving your profile'
          }
        },
      'car': { // Driving
        'submit': { // Cars are saved separately
          'id': 'profile e2',
          'title': 'Warning...',
          'message': 'Error while saving your car information'
        },
        'noInsurance': { // Don't allow the user to not have insurance
          'id': 'profile e3',
          'title': 'Warning...',
          'message': 'Setting your Status to Passenger Only. Please update insurance information to be a Driver'
        }
      },
      'from': { // Where From
        'submit': { // Save address is separate
          'id': 'profile e4',
          'title': 'Warning...',
          'message': 'Error while saving your new address'
        },
        'changePrimary': { // Changing the primary address
          'id': 'profile e5',
          'title': 'Warning...',
          'message': 'Error while changing your primary address'
        }
      },
      'destination': { // Where To
        'submit': { // Save destination is separate
          'id': 'profile e6',
          'title': 'Warning...',
          'message': 'Error while saving your new destination'
        }
      },
      'schedule': { // Your Schedule
        'submit': { // Save schedule is separate
          'id': 'profile e7',
          'title': 'Warning...',
          'message': 'Error while saving your schedule'
        },
      },
      'ride': { // The Ride
        'listening': { // During the drive...
          'submit': {
            'id': 'profile e8',
            'title': 'Warning...',
            'message': 'Error while saving your listening preferences'
          },
          'delete': { // have to remove the old preference only on listening preference
            'id': 'profile e9',
            'title': 'Warning...',
            'message': 'Error while saving your listening preferences'
          }
        },
        'music': {
          'submit': {
            'id': 'profile e10',
            'title': 'Warning...',
            'message': 'Error while saving your music preferences'
          },
          'delete': { // remove unchecked perf
            'id': 'profile e11',
            'title': 'Warning...',
            'message': 'Error while saving your music preferences'
          }
        }
      },
      'phone': {
        'duplicate': {
          'id': 'profile e11',
          'title': 'Error...',
          'message': 'Looks like someone else on Hovee is already using that phone number. Please check the number and try again.'
        }
      },
      'map': {
        'id': 'profile e12',
        'title': 'Error',
        'message': 'There was an error while trying to build the map. Please try again.'
      },
      'tagline': {
        'id': 'profile e13',
        'title': 'Error',
        'message': 'There was an error while trying save your tagline. Please try again.'
      }
    },

    // These are grouped together, Trip Detail, Trip Map and Trip In Progress
    'trip': {
      'detail': {
        'propose': { // New proposal or old, if the first start home comes before work arrive
          'overlap': {
            'id': 'trip e1',
            'title': 'Times overlap',
            'message': 'The start home comes before arrival at work. Please adjust your times so they do not overlap.'
          },
          'message': {
            'id': 'trip e2',
            'title': 'Error',
            'message': 'Message failed to send. Please try again later.'
          }
        },
        'rin': { // RIN message sent in one generic method
          'message': { // the main message is 2 parts with the subject in the middle. Ex: Error posting accept. Please try again.
            'id': 'trip e3',
            'pre': 'Error posting ',
            'post': '. Please try again.'
          }
        },
        'change': { // call to RIN send
          'rin': {
            'id': 'trip e4',
            'title': 'Ride Changes Proposed',
            'message': 'change proposal'
          }
        },
        'decline': { // call to RIN send
          'rin': {
            'id': 'trip e5',
            'title': 'Ride Declined',
            'message': 'decline'
          }
        },
        'accept': { // call to RIN send
          'rin': {
            'id': 'trip e6',
            'title': 'Ride Accepted',
            'message': 'accept'
          }
        },
        'cancel': { // Cancel is a 3 part message with name and date added. Ex: Your ride with Tom for Jun 1 failed.
          'id': 'trip e7',
          'title': 'Ride Cancelled',
          'pre': 'Your ride with ',
          'mid': ' for ',
          'post': ' failed.'
        },
        'create': { // Saving the first time is a send to create a trip
          'id': 'trip e8',
          'title': 'Propose A Ride',
          'message': 'Error creating trip. Please try again.'
        },
        'load': { // While loading the trip information for review
          'id': 'trip e9',
          'title': 'Trip Detail',
          'message': 'Could not retrieve trip info. Please try again.'
        }
      },
      'rating': { // This the Trip Rate and Stats page
        'submit': { // Saving the rating
          'id': 'trip e10',
          'title': 'Account Management',
          'message': 'Unable to perform the rate operation on ' // followed by the trip id for some reason
        },
        'exclude': { // Set member for exclusion
          'id': 'trip e11',
          'title': 'Trip Ratings',
          'message': 'Unable to perform the exclude operation on '
        }
      },
      'in': { // Trip In Progress page
        'progress': {
          'load': { // Loading trip information
            'id': 'trip e12',
            'title': 'Trip In Progress',
            'message': 'Could not retrieve trip info. Please try again.'
          },
          'save': { // Sending the status
            'id': 'trip e13',
            'title': 'Trip In Progress',
            'message': 'Status could not be updated. Please try again.'
          }
        }
      },
      'map': { // Trip Map page
        'load': {
          'id': 'trip e14',
          'title': 'Trip Map',
          'message': 'Could not retrieve trip info. Please try again.'
        }
      }
    },

    // Registrant (Registration) pages
    'registrant': {
      'new': {  // New member, name and password
        'member': {
          'error': {
            'message': { // This is a full page message if the user has an incorrect reg key
              'line1': {
                'part1': 'Your email has been confirmed, but the link had an error. Please contact us at',
                'email': 'support@hovee.com', // This is hyperlinked to support@hovee.com
                'part2': 'with a copy of your confirmation email.'
              },
              'line2': 'We apologize for any inconvenience this may have caused you.'
            }
          },
          'submit': {
            'id': 'registrant e2',
            'title': 'Account Management',
            'message': 'Registration unsuccessful. ' // plus API error text
          },
          'access': {
            'id': 'registrant e3',
            'title': 'Account Management',
            'message': 'Access token not received'
          }
        }
      },
      'forgotten': { // Forgot Password? page
        'password': {
          'not': {
            'found': { // API 400 Error, not found
              'id': 'forgotten e1',
              'title': 'Account Management',
              'message': 'The email address you entered cannot be found. Please make sure you are using your work email account.'
            }
          },
          'submit': { // All other errors
            'id': 'forgotten e2',
            'title': 'Account Management',
            'message': 'Error while trying to reset your email: ' // plus API error text
          }
        }
      },
      'key': { // Alternative key input page
        'submit': {
          'id': 'registrant e4',
          'title': 'Invalid key',
          'message': 'The entered key is invalid. Please double check and try again.'
        }
      },
      'signup': { // Not a member? page
        'submit': { // General "something went wrong" and I don't have any special handling message
          'id': 'registrant e5',
          'title': 'Membership Sign Up',
          'message': 'Sign up unsuccessful.'
        },
        'duplicate': {
          'done': { // User is done with on boarding so this is a actual duplicate email. Will send them to login page.
            'id': 'registrant e6',
            'title': 'Membership Sign Up',
            'message': 'An account already exists for this email. If this is you, please log in. In case you forgot your password, click on "Forgot Password?"<br><br>Enjoy Hovee!'
          },
          'undone': { // User has a confirmed email but hasn't done new_member name/password and on-boarding step yet. Goes to the registrant key page
            'id': 'registrant e7',
            'title': 'Membership Sign Up',
            'message': 'You have already signed up this email. Please refer to your confirmation email, or enter your registration key on this page.'
          }
        },
        'unsupported': { // Email/Company not supported. Goes to register_company page... May be we remove this pop up and go directly to the page?
          'id': 'registrant e8',
          'title': 'Membership Sign Up',
          'message': 'Sorry we could not find your email domain among the companies currently participating in Hovee. Would you like to join the pilot?'
        },
        'personal' : {
          'id': 'registrant e9',
          'title': 'Please use your work email to join.',
          'message': 'For Hovee to work properly, we need to confirm your company or university affiliation.  So we’ll know where you are commuting to, and better match you will all the people you work or study with.<br><br>So please try again, with your work or school email.<br><br> -Your friends at Hovee'
        }
      },
      'fan': {
        'duplicate': {
          'id': 'registrant e10',
          'title': 'Company Sign Up',
          'message': 'You have entered a duplicate company. Please check your email address and try again. Note: This company may already be on the waiting list...'
        },
        'submit': { // General "something went wrong" and I don't have any special handling message
          'id': 'registrant e11',
          'title': 'Company Sign Up',
          'message': 'Sign up unsuccessful.'
        }
      },
      'password': { // Password reset page
        'reset': {
          'submit': {
            'id': 'password e1',
            'title': 'Password Reset',
            'message': 'An error occurred while saving your password.'
          }
        }
      }
    },

    'login': {
      'load': { // <-- Not used
        'member': {
          'id': 'login e1',
          'title': 'Error',
          'message': 'Something went wrong with looking up your information.  Please log in again.',
          '401': {
            'id': 'login e2',
            'title': 'Error',
            'message': 'Your login has timed out.  Please log in again.'
          }
        },
        'access': {  // <-- Not used
          'id': 'login e3',
          'title': 'Error',
          'message': 'Access token not received'
        }
      },
      'token': { // Refresh token fail <-- Not used
        'refresh': {
          'id': 'token e1',
          'title': 'Time Out',
          'message': 'Your access has timed out. Please log in again.'
        },
        'not': { // Refresh token not found  <-- Not used
          'token': {
            'id': 'token e2',
            'title': 'Time Out',
            'message': 'Your access has timed out. Please log in again.'
          }
        }
      },
      'oauth': {
        'whoami': { // Lookup the account and member id, one not found, which means something probably went wrong with the creation
          'id': 'login e4',
          'title': 'Error',
          'message': 'Something went wrong when you were creating your account. Please contact customer support.'
        },
        'general': { // All errors returned from on login attempt API
          'id': 'login e5',
          'title': 'Error',
          'message': 'Username or password incorrect. Please try again.'
        }
      }
    },

    // Called during page change...
    'authenticated': {
      'transition': {
        'to': {
          'invalid': {
            'member': { // User tried to access page using another user's member id
              'id': 'transition e1',
              'title': 'Invalid page',
              'message': 'Error with the URL entered. One moment please.'
            }
          }
        }
      }
    },

    // Can happen on a refresh... Any error other than a 503 or 401
    'member': {
      'load': {
        'id': 'member e1',
        'title': 'Error',
        'message': "We're sorry, something went wrong. Please try again"
      }
    },

    // Google autocomplete
    'address': {
      'autocomplete': {
        'invalid': { // Didn't get a valid address back
          'id': 'address e1',
          'title': 'Error',
          'message': "Sorry, the address you entered is invalid or incomplete. Need help? Contact us at support@hovee.com"
        },
        'radius': { // Outside the fence
          'id': 'address e2',
          'title': 'Pilot',
          'message': "Sorry, we are only supporting Members in the San Francisco Bay Area at this time. Need help? Contact us at support@hovee.com"
        }
      }
    },

    'map': {
      'id': 'map e1',
      'title': 'Error',
      'message': 'There was an error while trying to build the map. Please try again.'
    }
  }
};
