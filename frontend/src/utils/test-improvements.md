# Testing Guide for Wallet and Data Improvements

This document outlines the testing procedures for the implemented improvements to wallet connection persistence, data refresh mechanisms, event-based updates, and transaction monitoring.

## 1. Wallet Connection Persistence Testing

### Test Case 1: Wallet Reconnection After Page Refresh
1. Connect your wallet to the application
2. Navigate to different pages (Designer, Collections)
3. Refresh the browser page
4. Expected: Wallet should automatically reconnect without user intervention
5. Check console logs for "WalletContext: Restoring wallet connection..." messages

### Test Case 2: Wallet State During Navigation
1. Connect your wallet
2. Navigate between pages (Designer → Collections → Collection Details → Mint)
3. Expected: Wallet connection should persist across all navigation
4. Check console logs for wallet state changes

### Test Case 3: Manual Reconnection
1. Disconnect your wallet manually
2. Expected: Reconnection banner should appear in navigation
3. Click "Reconnect Now" button
4. Expected: Wallet should reconnect successfully

## 2. Event-Based Updates Testing

### Test Case 4: Collection Creation Auto-Refresh
1. Navigate to Designer page
2. Click "Create Collection" and fill out the form
3. Submit the collection creation transaction
4. Expected: Transaction status should show with detailed progress
5. After confirmation, expected: Collection list should automatically update without manual refresh
6. Check console logs for "CollectionCreated event received" messages

### Test Case 5: NFT Minting Auto-Refresh
1. Navigate to a collection detail page
2. Mint a new NFT (when functionality is available)
3. Expected: Collection details should automatically update with new total supply
4. Check console logs for "NFT minted event received" messages

## 3. Transaction Monitoring Testing

### Test Case 6: Enhanced Transaction Status
1. Create a new collection
2. Expected: Detailed transaction status should appear with:
   - Pending state with spinner
   - Confirming state with progress indicator
   - Confirmed state with success icon
   - Block number and gas used details
3. Click "Details" to expand transaction information
4. Expected: All transaction details should be visible

### Test Case 7: Transaction Error Handling
1. Simulate a failed transaction (e.g., insufficient gas)
2. Expected: Error status should be displayed with clear error message
3. Expected: User should be able to retry the transaction

## 4. RPC Optimization Testing

### Test Case 8: Reduced RPC Calls
1. Open browser developer tools and monitor network requests
2. Navigate through the application
3. Expected: Fewer RPC calls due to event-based updates
4. Expected: 4-second polling intervals instead of constant requests
5. Check console logs for event-based update messages

### Test Case 9: Cache Invalidation
1. Create a new collection
2. Expected: Only relevant queries should be invalidated
3. Expected: No unnecessary refetches of unrelated data
4. Check console logs for query invalidation messages

## 5. Console Log Monitoring

During testing, monitor for these key log messages:

### Wallet Connection Logs:
- "WalletContext: Restoring wallet connection..."
- "WalletContext: Successfully reconnected to wallet"
- "Navigation: Wallet state changed"
- "Collection page: Wallet state changed"

### Event-Based Update Logs:
- "CollectionCreated event detected"
- "NFT minted (Transfer) event detected"
- "useCollection: CollectionCreated event received"
- "CollectionDetail: NFT minted event received"

### Transaction Monitoring Logs:
- "TransactionStatus: Transaction confirmed"
- "CreateCollectionModal: Transaction confirmed successfully"
- "useCreateCollection: Creating collection"
- "useCreateCollection: Transaction submitted"

### Data Refresh Logs:
- "useCollection: Invalidated collection queries due to new collection"
- "CollectionDetail: Invalidated NFT queries due to new mint"

## 6. Performance Metrics

Monitor these performance improvements:

### Before vs After:
- RPC call frequency: Should decrease significantly
- Page load times: Should improve with better caching
- Transaction confirmation UX: Should show detailed progress
- Data freshness: Should update automatically without manual refresh

## 7. Error Scenarios

Test these error scenarios:

### Network Issues:
1. Disconnect network during transaction
2. Expected: Graceful error handling with retry option

### Wallet Issues:
1. Lock wallet during operation
2. Expected: Clear error message and reconnection prompt

### Contract Issues:
1. Interact with contract when it's paused
2. Expected: Clear error message from contract

## 8. Cross-Browser Testing

Test in multiple browsers:
- Chrome/Brave (MetaMask)
- Firefox (MetaMask)
- Safari (Rainbow/Trust Wallet)
- Mobile browsers (wallet apps)

## 9. Success Criteria

The implementation is successful when:

✅ Wallet connections persist across page refreshes
✅ Data updates automatically without manual refresh
✅ Transaction status shows detailed progress
✅ RPC calls are reduced through event-based updates
✅ Error handling is clear and actionable
✅ Console logs show proper event detection
✅ Performance is noticeably improved
✅ User experience is seamless and intuitive

## 10. Troubleshooting

If issues occur:

1. Check browser console for error messages
2. Verify wallet is connected to Base Sepolia testnet
3. Clear browser cache and localStorage
4. Check network connectivity
5. Verify contract addresses are correct
6. Ensure wallet has sufficient ETH for gas fees